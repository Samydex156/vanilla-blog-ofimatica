-- ============================================================
--  MecaSamType Web — Supabase
--  Esquema propio «mecanografia» y cuentas propias (sin Supabase Auth).
--
--  CÓMO EJECUTARLO
--  1. Supabase → SQL Editor → New query → pegar TODO este archivo → Run.
--  2. Project Settings → API → «Exposed schemas» → añadir `mecanografia` → Save.
--  3. Espera unos segundos (la API recarga el esquema) y rellena js/config.js.
--
--  Todo va en una transacción: si una sola línea falla, no se crea nada.
--  Se puede volver a ejecutar sin borrar datos (usa IF NOT EXISTS / CREATE OR REPLACE).
--
--  SEGURIDAD
--  - Las contraseñas NO se guardan nunca en texto plano: bcrypt (pgcrypto).
--  - La app nunca lee tablas directamente: solo puede llamar a las RPC marcadas
--    más abajo, y todas exigen un token de sesión válido.
--  - Las tablas tienen RLS activo y sin políticas: nadie accede a ellas salvo
--    las funciones SECURITY DEFINER.
-- ============================================================

begin;

create schema if not exists mecanografia;

-- ------------------------------------------------------------
-- 0. pgcrypto (bcrypt). En Supabase suele vivir en el esquema «extensions».
-- ------------------------------------------------------------
do $$
begin
  execute 'create extension if not exists pgcrypto with schema extensions';
exception when others then
  begin
    execute 'create extension if not exists pgcrypto';
  exception when others then
    raise notice 'Aviso: no se pudo crear pgcrypto (%). Revisa Database → Extensions.', sqlerrm;
  end;
end;
$$;

-- ------------------------------------------------------------
-- 1. ALUMNOS
-- ------------------------------------------------------------
create table if not exists mecanografia.students (
  id              uuid primary key default gen_random_uuid(),
  username        text not null,
  display_name    text not null,
  password_hash   text not null,
  is_active       boolean not null default true,
  failed_attempts smallint not null default 0,
  locked_until    timestamptz,
  created_at      timestamptz not null default now(),
  last_login_at   timestamptz,
  constraint students_username_format
    check (username = lower(username) and username ~ '^[a-z0-9._-]{3,24}$'),
  constraint students_display_name_len
    check (char_length(display_name) between 2 and 48)
);

comment on table mecanografia.students is
  'Cuenta del alumno. Solo guarda usuario, nombre visible y hash bcrypt de la contraseña.';

create unique index if not exists students_username_key
  on mecanografia.students (username);

-- ------------------------------------------------------------
-- 2. SESIONES (token opaco que el navegador envía en cada RPC)
-- ------------------------------------------------------------
create table if not exists mecanografia.sessions (
  token        uuid primary key default gen_random_uuid(),
  student_id   uuid not null references mecanografia.students (id) on delete cascade,
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at   timestamptz not null default now() + interval '60 days'
);

create index if not exists sessions_student_idx
  on mecanografia.sessions (student_id);
create index if not exists sessions_expires_idx
  on mecanografia.sessions (expires_at);

-- ------------------------------------------------------------
-- 3. PROGRESO POR LECCIÓN
-- ------------------------------------------------------------
create table if not exists mecanografia.lesson_progress (
  student_id        uuid not null references mecanografia.students (id) on delete cascade,
  lesson_id         text not null,
  best_wpm          numeric(6,1) not null default 0,
  best_accuracy     numeric(5,2) not null default 0,
  stars             smallint not null default 0,
  attempts          integer not null default 0,
  completed         boolean not null default false,
  last_practiced_at timestamptz not null default now(),
  primary key (student_id, lesson_id),
  constraint lesson_progress_wpm check (best_wpm >= 0 and best_wpm <= 300),
  constraint lesson_progress_acc check (best_accuracy >= 0 and best_accuracy <= 100),
  constraint lesson_progress_stars check (stars between 0 and 3),
  constraint lesson_progress_attempts check (attempts >= 0)
);

create index if not exists lesson_progress_student_idx
  on mecanografia.lesson_progress (student_id, last_practiced_at desc);

-- ------------------------------------------------------------
-- 4. HISTORIAL DE PRÁCTICAS
-- ------------------------------------------------------------
create table if not exists mecanografia.practice_sessions (
  id               bigint generated always as identity primary key,
  student_id       uuid not null references mecanografia.students (id) on delete cascade,
  lesson_id        text not null,
  wpm              numeric(6,1) not null,
  accuracy         numeric(5,2) not null,
  duration_seconds integer not null default 0,
  total_chars      integer not null default 0,
  errors           integer not null default 0,
  created_at       timestamptz not null default now(),
  constraint practice_wpm check (wpm >= 0 and wpm <= 300),
  constraint practice_acc check (accuracy >= 0 and accuracy <= 100),
  constraint practice_duration check (duration_seconds >= 0)
);

create index if not exists practice_sessions_student_idx
  on mecanografia.practice_sessions (student_id, created_at desc);

-- ------------------------------------------------------------
-- 5. TEXTOS DEL SPRINT
-- ------------------------------------------------------------
create table if not exists mecanografia.sprint_texts (
  id         bigint generated always as identity primary key,
  title      text not null unique,
  body       text not null,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  constraint sprint_body_length check (char_length(body) between 120 and 1200)
);

-- ------------------------------------------------------------
-- 6. RESULTADOS DEL SPRINT
-- ------------------------------------------------------------
create table if not exists mecanografia.sprint_runs (
  id               bigint generated always as identity primary key,
  student_id       uuid not null references mecanografia.students (id) on delete cascade,
  text_id          bigint references mecanografia.sprint_texts (id) on delete set null,
  wpm              numeric(6,1) not null,
  accuracy         numeric(5,2) not null,
  chars            integer not null default 0,
  errors           integer not null default 0,
  duration_seconds integer not null default 60,
  created_at       timestamptz not null default now(),
  constraint sprint_wpm check (wpm >= 0 and wpm <= 300),
  constraint sprint_acc check (accuracy >= 0 and accuracy <= 100),
  constraint sprint_chars check (chars >= 0 and chars <= 4000),
  constraint sprint_duration check (duration_seconds between 1 and 120)
);

create index if not exists sprint_runs_student_idx
  on mecanografia.sprint_runs (student_id, wpm desc, created_at desc);
create index if not exists sprint_runs_rank_idx
  on mecanografia.sprint_runs (wpm desc, accuracy desc, created_at asc);

-- ============================================================
-- 7. SESIONES: resolver y renovar el token
-- ============================================================
create or replace function mecanografia.touch_session(p_token uuid)
returns uuid
language plpgsql
security definer
set search_path = mecanografia, public
as $$
declare
  v_student uuid;
begin
  if p_token is null then
    raise exception 'Sesión no válida o caducada' using errcode = '28000';
  end if;

  update mecanografia.sessions s
     set last_seen_at = now(),
         expires_at   = now() + interval '60 days'
   where s.token = p_token
     and s.expires_at > now()
  returning s.student_id into v_student;

  if v_student is null then
    raise exception 'Sesión no válida o caducada' using errcode = '28000';
  end if;

  if not exists (
    select 1 from mecanografia.students st
     where st.id = v_student and st.is_active
  ) then
    raise exception 'Esta cuenta está desactivada' using errcode = '28000';
  end if;

  return v_student;
end;
$$;

-- ============================================================
-- 8. CUENTAS
-- ============================================================
create or replace function mecanografia.register_student(
  p_username     text,
  p_display_name text,
  p_password     text
)
returns table (auth_token uuid, username text, display_name text)
language plpgsql
security definer
set search_path = mecanografia, public, extensions
as $$
declare
  v_username text := lower(btrim(coalesce(p_username, '')));
  v_name     text := btrim(coalesce(p_display_name, ''));
  v_id       uuid;
  v_token    uuid;
begin
  if v_username !~ '^[a-z0-9._-]{3,24}$' then
    raise exception 'El usuario debe tener entre 3 y 24 caracteres: minúsculas, números, punto, guion o guion bajo.';
  end if;

  if char_length(v_name) < 2 or char_length(v_name) > 48 then
    raise exception 'Escribe tu nombre y apellido (entre 2 y 48 caracteres).';
  end if;

  if char_length(coalesce(p_password, '')) < 8 then
    raise exception 'La contraseña debe tener al menos 8 caracteres.';
  end if;

  if exists (
    select 1 from mecanografia.students st where st.username = v_username
  ) then
    raise exception 'Ese usuario ya existe. Prueba a entrar o elige otro.'
      using errcode = '23505';
  end if;

  insert into mecanografia.students as st (username, display_name, password_hash)
  values (v_username, v_name, crypt(p_password, gen_salt('bf', 10)))
  returning st.id into v_id;

  insert into mecanografia.sessions as ns (student_id)
  values (v_id)
  returning ns.token into v_token;

  update mecanografia.students st
     set last_login_at = now()
   where st.id = v_id;

  return query select v_token, v_username, v_name;
end;
$$;

create or replace function mecanografia.login_student(
  p_username text,
  p_password text
)
returns table (auth_token uuid, username text, display_name text)
language plpgsql
security definer
set search_path = mecanografia, public, extensions
as $$
declare
  v_username text := lower(btrim(coalesce(p_username, '')));
  v_row      mecanografia.students;
  v_token    uuid;
begin
  select st.* into v_row
    from mecanografia.students st
   where st.username = v_username;

  if not found then
    -- Trabajo equivalente a un bcrypt para no delatar por tiempo si el usuario existe.
    perform crypt(coalesce(p_password, ''), gen_salt('bf', 10));
    raise exception 'Usuario o contraseña incorrectos.' using errcode = '28P01';
  end if;

  if not v_row.is_active then
    raise exception 'Esta cuenta está desactivada. Habla con tu profesor.'
      using errcode = '28P01';
  end if;

  if v_row.locked_until is not null and v_row.locked_until > now() then
    raise exception 'Demasiados intentos fallidos. Espera unos minutos.'
      using errcode = '53300';
  end if;

  if v_row.password_hash <> crypt(coalesce(p_password, ''), v_row.password_hash) then
    update mecanografia.students st
       set failed_attempts = st.failed_attempts + 1,
           locked_until    = case
             when st.failed_attempts + 1 >= 5 then now() + interval '5 minutes'
             else st.locked_until
           end
     where st.id = v_row.id;

    raise exception 'Usuario o contraseña incorrectos.' using errcode = '28P01';
  end if;

  update mecanografia.students st
     set failed_attempts = 0,
         locked_until    = null,
         last_login_at   = now()
   where st.id = v_row.id;

  insert into mecanografia.sessions as ns (student_id)
  values (v_row.id)
  returning ns.token into v_token;

  return query select v_token, v_row.username, v_row.display_name;
end;
$$;

create or replace function mecanografia.get_me(p_token uuid)
returns table (username text, display_name text)
language plpgsql
security definer
set search_path = mecanografia, public
as $$
declare
  v_id uuid;
begin
  v_id := mecanografia.touch_session(p_token);

  return query
    select st.username, st.display_name
      from mecanografia.students st
     where st.id = v_id;
end;
$$;

create or replace function mecanografia.logout_student(p_token uuid)
returns void
language plpgsql
security definer
set search_path = mecanografia, public
as $$
begin
  delete from mecanografia.sessions s where s.token = p_token;
end;
$$;

-- ============================================================
-- 9. PROGRESO
-- ============================================================
create or replace function mecanografia.record_lesson_result(
  p_token       uuid,
  p_lesson_id   text,
  p_wpm         numeric,
  p_accuracy    numeric,
  p_stars       smallint,
  p_duration    integer,
  p_total_chars integer,
  p_errors      integer
)
returns mecanografia.lesson_progress
language plpgsql
security definer
set search_path = mecanografia, public
as $$
declare
  v_id  uuid;
  v_row mecanografia.lesson_progress;
begin
  v_id := mecanografia.touch_session(p_token);

  insert into mecanografia.practice_sessions
    (student_id, lesson_id, wpm, accuracy, duration_seconds, total_chars, errors)
  values
    (v_id, p_lesson_id, p_wpm, p_accuracy, p_duration, p_total_chars, p_errors);

  insert into mecanografia.lesson_progress as lp
    (student_id, lesson_id, best_wpm, best_accuracy, stars, attempts, completed, last_practiced_at)
  values
    (v_id, p_lesson_id, p_wpm, p_accuracy, p_stars, 1, true, now())
  on conflict (student_id, lesson_id) do update set
    best_wpm          = greatest(lp.best_wpm, excluded.best_wpm),
    best_accuracy     = greatest(lp.best_accuracy, excluded.best_accuracy),
    stars             = greatest(lp.stars, excluded.stars),
    attempts          = lp.attempts + 1,
    completed         = true,
    last_practiced_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function mecanografia.get_progress(p_token uuid)
returns setof mecanografia.lesson_progress
language plpgsql
security definer
set search_path = mecanografia, public
as $$
declare
  v_id uuid;
begin
  v_id := mecanografia.touch_session(p_token);

  return query
    select lp.*
      from mecanografia.lesson_progress lp
     where lp.student_id = v_id
     order by lp.last_practiced_at desc;
end;
$$;

create or replace function mecanografia.get_practice_sessions(p_token uuid)
returns setof mecanografia.practice_sessions
language plpgsql
security definer
set search_path = mecanografia, public
as $$
declare
  v_id uuid;
begin
  v_id := mecanografia.touch_session(p_token);

  return query
    select ps.*
      from mecanografia.practice_sessions ps
     where ps.student_id = v_id
     order by ps.created_at desc
     limit 80;
end;
$$;

-- ============================================================
-- 10. SPRINT
-- ============================================================
create or replace function mecanografia.get_random_sprint_text(p_token uuid)
returns table (id bigint, title text, body text)
language plpgsql
security definer
set search_path = mecanografia, public
as $$
begin
  perform mecanografia.touch_session(p_token);

  return query
    select t.id, t.title, t.body
      from mecanografia.sprint_texts t
     where t.active = true
     order by random()
     limit 1;
end;
$$;

create or replace function mecanografia.submit_sprint_run(
  p_token     uuid,
  p_text_id   bigint,
  p_wpm       numeric,
  p_accuracy  numeric,
  p_chars     integer,
  p_errors    integer
)
returns bigint
language plpgsql
security definer
set search_path = mecanografia, public
as $$
declare
  v_id  uuid;
  v_run bigint;
begin
  v_id := mecanografia.touch_session(p_token);

  insert into mecanografia.sprint_runs as sr
    (student_id, text_id, wpm, accuracy, chars, errors, duration_seconds)
  values
    (v_id, p_text_id, p_wpm, p_accuracy, p_chars, p_errors, 60)
  returning sr.id into v_run;

  return v_run;
end;
$$;

create or replace function mecanografia.get_sprint_best(p_token uuid)
returns table (wpm numeric, accuracy numeric, chars integer, achieved_at timestamptz)
language plpgsql
security definer
set search_path = mecanografia, public
as $$
declare
  v_id uuid;
begin
  v_id := mecanografia.touch_session(p_token);

  return query
    select r.wpm, r.accuracy, r.chars, r.created_at
      from mecanografia.sprint_runs r
     where r.student_id = v_id
     order by r.wpm desc, r.accuracy desc, r.created_at asc
     limit 1;
end;
$$;

create or replace function mecanografia.get_sprint_leaderboard(p_token uuid)
returns table (
  rank         bigint,
  username     text,
  display_name text,
  wpm          numeric,
  accuracy     numeric,
  chars        integer,
  achieved_at  timestamptz
)
language plpgsql
security definer
set search_path = mecanografia, public
as $$
begin
  perform mecanografia.touch_session(p_token);

  return query
    with best as (
      select distinct on (r.student_id)
        r.student_id, r.wpm, r.accuracy, r.chars, r.created_at
      from mecanografia.sprint_runs r
      where r.wpm > 0
      order by r.student_id, r.wpm desc, r.accuracy desc, r.created_at asc
    )
    select
      row_number() over (
        order by b.wpm desc, b.accuracy desc, b.created_at asc
      ) as rk,
      st.username,
      st.display_name,
      b.wpm,
      b.accuracy,
      b.chars,
      b.created_at
    from best b
    join mecanografia.students st on st.id = b.student_id
    where st.is_active
    order by b.wpm desc, b.accuracy desc, b.created_at asc
    limit 10;
end;
$$;

-- ============================================================
-- 11. UTILIDAD PARA EL PROFESOR (solo se usa desde el SQL Editor)
-- ============================================================
create or replace function mecanografia.reset_password(
  p_username     text,
  p_new_password text
)
returns void
language plpgsql
security definer
set search_path = mecanografia, public, extensions
as $$
declare
  v_username text := lower(btrim(coalesce(p_username, '')));
  v_id       uuid;
begin
  if char_length(coalesce(p_new_password, '')) < 8 then
    raise exception 'La contraseña debe tener al menos 8 caracteres.';
  end if;

  select st.id into v_id
    from mecanografia.students st
   where st.username = v_username;

  if v_id is null then
    raise exception 'No existe ningún alumno con el usuario «%».', v_username;
  end if;

  update mecanografia.students st
     set password_hash   = crypt(p_new_password, gen_salt('bf', 10)),
         failed_attempts = 0,
         locked_until    = null
   where st.id = v_id;

  -- Cierra sus sesiones abiertas: deberá entrar con la contraseña nueva.
  delete from mecanografia.sessions s where s.student_id = v_id;
end;
$$;

-- ============================================================
-- 12. RLS: activo y SIN políticas = nadie entra salvo las funciones
-- ============================================================
alter table mecanografia.students          enable row level security;
alter table mecanografia.sessions          enable row level security;
alter table mecanografia.lesson_progress   enable row level security;
alter table mecanografia.practice_sessions enable row level security;
alter table mecanografia.sprint_texts      enable row level security;
alter table mecanografia.sprint_runs       enable row level security;

-- ============================================================
-- 13. PERMISOS
--     anon/authenticated no pueden tocar tablas: solo ejecutar las RPC.
-- ============================================================
revoke all on schema mecanografia from public, anon, authenticated;
grant usage on schema mecanografia to anon, authenticated;

revoke all on all tables    in schema mecanografia from public, anon, authenticated;
revoke all on all sequences in schema mecanografia from public, anon, authenticated;
revoke all on all functions in schema mecanografia from public, anon, authenticated;

grant execute on function mecanografia.register_student(text, text, text) to anon, authenticated;
grant execute on function mecanografia.login_student(text, text) to anon, authenticated;
grant execute on function mecanografia.get_me(uuid) to anon, authenticated;
grant execute on function mecanografia.logout_student(uuid) to anon, authenticated;
grant execute on function mecanografia.record_lesson_result(uuid, text, numeric, numeric, smallint, integer, integer, integer) to anon, authenticated;
grant execute on function mecanografia.get_progress(uuid) to anon, authenticated;
grant execute on function mecanografia.get_practice_sessions(uuid) to anon, authenticated;
grant execute on function mecanografia.get_random_sprint_text(uuid) to anon, authenticated;
grant execute on function mecanografia.submit_sprint_run(uuid, bigint, numeric, numeric, integer, integer) to anon, authenticated;
grant execute on function mecanografia.get_sprint_best(uuid) to anon, authenticated;
grant execute on function mecanografia.get_sprint_leaderboard(uuid) to anon, authenticated;

-- ============================================================
-- 14. TEXTOS INICIALES DEL SPRINT
-- ============================================================
insert into mecanografia.sprint_texts (title, body) values
  ('La oficina que fluye',
   'Una oficina que fluye no se mide por la cantidad de correos enviados, sino por el tiempo que las personas dedican a pensar. Organizar los archivos, nombrar las carpetas con criterio y cerrar las pestañas que no se usan son gestos pequeños que devuelven calma. La productividad nace del orden y se sostiene con pausas breves.'),
  ('Atajos que ahorran horas',
   'Copiar, cortar y pegar son solo el principio. Cuando dominas los atajos de tu editor, tus manos dejan de interrumpir tus ideas. Guardar con Ctrl y S, buscar con Ctrl y F, deshacer con Ctrl + Z: tres combinaciones que repetidas durante un curso entero ahorran horas. Aprender el teclado es invertir en tu propio tiempo.'),
  ('El correo perfecto',
   'Un buen correo se entiende en la primera lectura. Saluda con claridad, explica el motivo en la primera línea y cierra con una petición concreta. Evita los párrafos interminables y revisa la ortografía antes de enviar. Si el asunto no resume el mensaje, el destinatario tardará más en responder. Escribir bien también es respetar el tiempo ajeno.'),
  ('La nube como cuaderno',
   'Guardar en la nube es mucho más que tener una copia de seguridad. Es poder continuar un documento desde otra computadora, compartir una carpeta con el equipo y recuperar una versión anterior cuando algo sale mal. La clave está en nombrar los archivos con fechas y en no compartir enlaces con permisos de edición sin necesidad.'),
  ('Seguridad sin miedo',
   'Una contraseña larga y distinta para cada servicio vale más que cualquier programa milagroso. Activa la verificación en dos pasos, desconfía de los enlaces que piden datos urgentes y cierra la sesión cuando uses un equipo compartido. La seguridad digital no es un trámite: es una costumbre que se practica todos los días.'),
  ('Aprender haciendo',
   'Leer sobre una herramienta sirve para orientarse, pero la destreza aparece al practicar. Dedica quince minutos diarios a repetir un ejercicio, equivócate y vuelve a intentarlo. La memoria de los dedos se construye con repetición y descanso. Ninguna clase sustituye las horas de práctica, pero una buena guía evita perder el rumbo.'),
  ('Una pausa activa',
   'Después de cuarenta minutos frente a la pantalla, levanta la vista. Estira los hombros, mueve las muñecas y camina unos pasos. La pausa activa no interrumpe el trabajo: lo sostiene. Los ojos agradecen mirar algo lejano y la espalda agradece cambiar de postura. Vuelve al teclado con las manos relajadas y la mente despejada.'),
  ('Presentaciones que se entienden',
   'Una diapositiva no es un documento. Si el público tiene que leer todo lo que dices, deja de escucharte. Usa una idea por pantalla, jerarquiza el tamaño del texto y acompaña con imágenes que expliquen. El contraste y el espacio en blanco son aliados. La presentación perfecta es la que se recuerda sin haberla leído.'),
  ('El arte de nombrar archivos',
   'Un nombre de archivo claro ahorra búsquedas y discusiones. Usa fechas en formato año mes día, evita los espacios innecesarios y sé específico: no es lo mismo informe final que informe ventas marzo. Si el proyecto tiene varias versiones, numéralas. Una carpeta ordenada es un mapa que cualquiera puede leer sin preguntar.'),
  ('El café y la concentración',
   'El café de la mañana no hace magia, pero ayuda a empezar. Lo que de verdad sostiene la concentración es una tarea concreta y un límite de tiempo. Prueba trabajar veinticinco minutos sin notificaciones y descansar cinco. Al terminar, anota qué avanzaste. La constancia de pequeños bloques vence a las jornadas heroicas que nunca llegan.'),
  ('Del papel a la pantalla',
   'Digitalizar no significa escanear todo y olvidarlo. Significa decidir qué merece conservarse, cómo encontrarlo después y quién puede acceder. Una carpeta compartida con nombres claros vale más que mil archivos sueltos en el escritorio. El papel tiene su lugar, pero la información importante debe poder buscarse en segundos.'),
  ('El futuro del trabajo',
   'Las herramientas cambian, pero saber escribir, ordenar ideas y comunicar con claridad sigue siendo el centro. La tecnología acelera lo que ya sabes hacer; no reemplaza el criterio. Aprende el teclado, domina tu procesador de textos y cuida tus archivos. Lo demás llega con práctica y curiosidad.')
on conflict (title) do nothing;

-- Recarga la caché de la API para que vea el esquema nuevo.
notify pgrst, 'reload schema';

commit;

-- ============================================================
-- 15. VERIFICACIÓN
--     Ejecuta esto después (o vuelve a ejecutar solo este bloque).
--     Resultado esperado:
--       tablas=6  funciones=13  textos=12  rls=6  expuestas_a_anon=11
-- ============================================================
select 'tablas' as comprobacion, count(*)::text as resultado
  from information_schema.tables
 where table_schema = 'mecanografia'
union all
select 'funciones', count(*)::text
  from information_schema.routines
 where routine_schema = 'mecanografia'
union all
select 'textos', count(*)::text
  from mecanografia.sprint_texts
union all
select 'rls', count(*)::text
  from pg_tables
 where schemaname = 'mecanografia' and rowsecurity
union all
select 'expuestas_a_anon', count(*)::text
  from information_schema.routine_privileges
 where routine_schema = 'mecanografia' and grantee = 'anon';
