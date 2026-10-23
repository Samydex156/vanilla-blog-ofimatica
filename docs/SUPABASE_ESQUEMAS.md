# Supabase con esquemas: guía de trabajo y bitácora

> Documento de referencia para cualquier proyecto de este repositorio (o fuera
> de él) que use Supabase y quiera **ordenar sus tablas por esquemas**.
> Se escribió a partir del montaje real del módulo **09 Mecanografía**
> (octubre de 2026), verificado contra el proyecto `ehscdeiexsedaslxoezw`.

---

## 0. Resumen en 60 segundos

- Un **esquema de Postgres por aplicación** dentro del mismo proyecto de Supabase.
- La API REST solo ve los esquemas que declares en **Exposed schemas**. Sin eso,
  todo devuelve `PGRST106`.
- Cada app gestiona sus tablas, sus funciones y sus permisos; nadie más las toca.
- Si no usas Supabase Auth, necesitas **cuentas propias**: tabla de usuarios,
  bcrypt para contraseñas y tokens de sesión.
- El cliente tiene que decir a qué esquema apunta: `db: { schema: "mi_app" }`.

---

## 1. Qué estrategia elegir

| Estrategia | Cuándo sirve | Coste |
|---|---|---|
| **Esquema propio** (`mecanografia.*`) | Varias apps en un proyecto, quieres orden sin gastar proyectos | 1 ajuste en el panel + 1 línea de código |
| **Proyecto separado** | Aislamiento total, equipos o clientes distintos | Límite de proyectos del plan; otro panel que mantener |
| **Prefijo de tablas** (`meca_clientes`) | Prisa, una sola app pequeña | Sigue todo mezclado en `public` |

**Recomendación por defecto: esquema propio.** Es el único que ordena de verdad
sin multiplicar proyectos, y el cambio en el cliente es pequeño.

---

## 2. Reglas de la casa

1. **Un esquema = una aplicación.** Nombre en minúsculas, sin guiones ni
   acentos, corto y estable: `mecanografia`, `word`, `excel`, `acceso`.
2. **Nunca tocar** los esquemas del sistema: `public`, `auth`, `storage`,
   `extensions`, `realtime`, `graphql`, `graphql_public`, `vault`, `net`,
   `supabase_functions`, `supabase_migrations`, `pgsodium`.
3. **`public` no se usa para apps nuevas.** Se queda como legado.
4. **Las tablas nunca se exponen a `anon`.** El cliente habla con funciones
   `SECURITY DEFINER`, no con tablas.
5. **Toda función `SECURITY DEFINER` lleva `set search_path`** fijo. Sin eso es
   una puerta abierta a secuestro de `search_path`.
6. **RLS activo y sin políticas** en todas las tablas: doble candado, aunque ya
   no haya permisos de tabla.
7. **Los permisos se conceden uno a uno**, nunca `GRANT ALL ON ALL TABLES`.
8. **Toda operación va en una transacción** (`begin; … commit;`). Si falla una
   línea, no queda basura a medias.

---

## 3. Plantilla mínima de esquema

```sql
begin;

create schema if not exists mi_app;

create table if not exists mi_app.items (
  id         uuid primary key default gen_random_uuid(),
  owner      uuid not null,
  titulo     text not null,
  creado_en  timestamptz not null default now()
);

-- Función pública: única puerta de entrada
create or replace function mi_app.listar_items(p_token uuid)
returns setof mi_app.items
language plpgsql
security definer
set search_path = mi_app, public
as $$
declare
  v_owner uuid;
begin
  v_owner := mi_app.touch_session(p_token);
  return query
    select i.* from mi_app.items i where i.owner = v_owner order by i.creado_en desc;
end;
$$;

alter table mi_app.items enable row level security;

revoke all on schema mi_app from public, anon, authenticated;
grant usage on schema mi_app to anon, authenticated;
revoke all on all tables    in schema mi_app from public, anon, authenticated;
revoke all on all sequences in schema mi_app from public, anon, authenticated;
revoke all on all functions in schema mi_app from public, anon, authenticated;

grant execute on function mi_app.listar_items(uuid) to anon, authenticated;

notify pgrst, 'reload schema';

commit;
```

Y al final, **siempre**, el bloque de verificación:

```sql
select 'tablas' as comprobacion, count(*)::text as resultado
  from information_schema.tables where table_schema = 'mi_app'
union all
select 'funciones', count(*)::text
  from information_schema.routines where routine_schema = 'mi_app'
union all
select 'rls', count(*)::text
  from pg_tables where schemaname = 'mi_app' and rowsecurity
union all
select 'expuestas_a_anon', count(*)::text
  from information_schema.routine_privileges
 where routine_schema = 'mi_app' and grantee = 'anon';
```

Anota el resultado esperado en el propio archivo SQL. Así, dentro de seis meses,
sabrás si alguien tocó algo.

---

## 4. Poner en marcha un proyecto nuevo (5 pasos)

1. **Crear el proyecto** en Supabase y guardar `Project URL` + `anon public key`.
2. **Pegar el SQL** en `SQL Editor → New query → Run`. Todo dentro de `begin/commit`.
3. **Exponer el esquema**: `Project Settings → API → Exposed schemas` → añadir
   el nombre (queda `public, graphql_public, mi_app`) → **Save**.
4. **Configurar el cliente**:

```js
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(URL, ANON_KEY, {
  db: { schema: "mi_app" },
  auth: { persistSession: false, autoRefreshToken: false },
});
```

Con `db.schema`, **todas** las llamadas (`.from()` y `.rpc()`) van al esquema.
Si prefieres cambiarlo por consulta: `supabase.schema("mi_app").from("items")`.

5. **Probar** con la batería de la sección 7 antes de escribir una sola línea de UI.

> Ojo: el paso 3 no es opcional y es el que más se olvida. Si lo saltas, todo
> responde `406 PGRST106 — Invalid schema`.

---

## 5. Migrar las apps que ya tienes en `public`

Tienes ~6 aplicaciones con las tablas mezcladas. Se puede ordenar **sin
reescribir nada**, moviendo cada app a su esquema.

### 5.1 Inventario primero

```sql
-- Qué hay y cuánto pesa
select relname as tabla, n_live_tup as filas_aprox
  from pg_stat_user_tables
 where schemaname = 'public'
 order by n_live_tup desc;

-- Vistas y funciones sueltas en public
select table_name  from information_schema.views
 where table_schema = 'public';
select routine_name from information_schema.routines
 where routine_schema = 'public';
```

### 5.2 Agrupa por aplicación

Haz una lista de qué tablas pertenecen a qué app. Si hay dudas, mira las
relaciones:

```sql
select conname,
       conrelid::regclass as tabla_hija,
       confrelid::regclass as tabla_padre
  from pg_constraint
 where contype = 'f'
 order by 2;
```

Las tablas que se referencian entre sí son de la misma app.

### 5.3 Receta de migración (una app, una ventana)

```sql
begin;

create schema if not exists app_uno;

-- Tablas: índices, constraints, triggers, políticas RLS y secuencias propias
-- se mueven con ellas. No hay que recrear nada.
alter table public.clientes set schema app_uno;
alter table public.pedidos  set schema app_uno;
alter table public.lineas   set schema app_uno;

-- Vistas y funciones de esa app (si las hay)
alter view     public.vista_pedidos   set schema app_uno;
alter function public.total_pedido(uuid) set schema app_uno;

-- Permisos del esquema nuevo
grant usage on schema app_uno to anon, authenticated;

commit;
```

Después: **Exposed schemas** + actualizar el cliente de esa app.

### 5.4 Qué viaja solo y qué no

| Objeto | ¿Se mueve con `SET SCHEMA`? |
|---|---|
| Tabla | Sí |
| Índices y constraints | Sí (dependen de la tabla) |
| Triggers | Sí (el trigger; la función que ejecuta, no) |
| Políticas RLS | Sí |
| Secuencias `identity` / `serial` | Sí (son owned por la tabla) |
| Secuencias compartidas a mano | **No** — revísalas |
| Vistas | **No** — muévelas aparte |
| Funciones | **No** — muévelas aparte |
| Tipos / enums propios | **No** — `alter type … set schema` |
| Grants de tabla | Se quedan con el objeto (ACL) |
| `USAGE` del esquema | **No** — hay que concederlo |

### 5.5 Riesgos reales y cómo evitarlos

1. **La app deja de funcionar al instante** si su cliente no apunta al nuevo
   esquema. Despliega código y SQL **en la misma ventana**, o hazlo con la app
   parada.
2. **Vistas que se quedan en `public`** y siguen expuestas: o las mueves, o las
   borras. Una vista en `public` puede filtrar datos del esquema nuevo.
3. **Funciones con `search_path` fijo a `public`**: si moviste la tabla, la
   función ya no la encuentra. Corrige el `search_path` o califica los nombres.
4. **Relaciones entre apps**: la API **no** puede hacer joins entre esquemas
   distintos (el embedding de PostgREST es por esquema). Si dos apps comparten
   datos, resuélvelo con una vista o una RPC en el esquema de una de ellas.
5. **Realtime**: si una tabla está en la publicación `supabase_realtime`, sigue
   funcionando, pero el cliente debe suscribirse indicando el esquema.
6. **Sin vuelta atrás planificada**: aunque es reversible
   (`alter table app_uno.clientes set schema public;`), ten un respaldo antes.

### 5.6 Orden recomendado

1. Empieza por la app **más pequeña y menos usada**. Aprende el proceso sin
   riesgo.
2. Una app por ventana. Verifica con la sección 7 antes de pasar a la siguiente.
3. Deja `public` vacío al final y **no lo elimines**: Supabase lo necesita para
   `graphql_public` y algunas extensiones.

---

## 6. Checklist antes de escribir código

- [ ] Esquema creado y expuesto en **Exposed schemas**.
- [ ] Bloque de verificación del SQL ejecutado y con los números esperados.
- [ ] `anon` no tiene permisos sobre ninguna tabla (`42501` al intentar leer).
- [ ] Las RPC públicas exigen token.
- [ ] Token inválido devuelve `28000`, no datos.
- [ ] Logout invalida el token de verdad.
- [ ] `config.js` (o `.env`) con URL + anon key, nunca `service_role`.
- [ ] El cliente tiene `db: { schema: "…" }`.

---

## 7. Cómo se prueba esto (la batería)

La idea central: **no confiar en lo que dice la interfaz**. Se prueba la API por
debajo y, después, se comprueba la base de datos.

### 7.1 Qué se prueba

1. **Camino feliz**: cada RPC con datos válidos.
2. **Caminos tristes**: cada validación debe fallar con el código correcto.
3. **Seguridad**: sin token, con token ajeno, con token revocado, acceso directo
   a tablas.
4. **Persistencia**: se vuelve a leer lo escrito, desde otra sesión.
5. **Interfaz**: navegador real, clics reales, captura de pantalla.

### 7.2 Batería por REST

PostgREST es la misma API que usa la app, así que probarla por `Invoke-WebRequest`
(o `curl`) es equivalente y mucho más rápido que hacer clics.

Cabeceras imprescindibles para un esquema propio:

```http
apikey: <anon_key>
Authorization: Bearer <anon_key>
Content-Type: application/json
Accept-Profile: mi_app
Content-Profile: mi_app
```

Las dos últimas son las que eligen el esquema; `supabase-js` las pone solo
cuando usas `db.schema`.

Ejemplo mínimo:

```powershell
$r = Invoke-WebRequest -Uri "$Url/rest/v1/rpc/get_me" -Method Post `
  -Headers $headers -Body '{"p_token":"00000000-0000-0000-0000-000000000000"}' `
  -UseBasicParsing -SkipHttpErrorCheck

"HTTP $($r.StatusCode) · $($r.Content)"
# Esperado: HTTP 403 · {"code":"28000","message":"Sesión no válida o caducada"}
```

### 7.3 Las pruebas negativas que de verdad importan

| Ataque o error | Qué debe pasar |
|---|---|
| Leer una tabla directamente | `401` / `42501` |
| Llamar una RPC sin token | `404 PGRST202` o `403 28000` |
| Token inventado | `403 28000` |
| Token tras logout | `403 28000` |
| Progreso de otro alumno | Solo devuelve lo del token, nunca lo ajeno |
| Contraseña débil | `400` con mensaje claro |
| Usuario duplicado | `409 23505` |
| Contraseña incorrecta | `403 28P01`, sin distinguir si el usuario existe |
| Esquema no expuesto | `406 PGRST106` |
| SQL no ejecutado | `404 PGRST205` |

Si alguna de estas devuelve datos, hay un agujero.

### 7.4 Interfaz y capturas

Para la UI uso `agent-browser`, un navegador automatizado por línea de comandos
(ya está instalado en este equipo). Permite exactamente lo que hace falta:
rellenar, hacer clic, leer el DOM, ver la consola y sacar capturas.

```powershell
# 1. Servir la carpeta (los módulos ES no funcionan con file://)
python -m http.server 8123

# 2. Abrir
agent-browser open "http://127.0.0.1:8123/mecanografia/"

# 3. Rellenar y enviar
agent-browser fill "#authUsername" "ana.lopez"
agent-browser fill "#authPassword" "MiClaveSegura2026"
agent-browser eval "document.querySelector('#authSubmit').click()"

# 4. Comprobar el resultado en el DOM
agent-browser eval "document.querySelector('#userName').textContent"
agent-browser eval "document.querySelectorAll('.lesson-card.is-complete').length"

# 5. Errores y consola (aquí se ven los fallos de verdad)
agent-browser errors
agent-browser console

# 6. Captura
agent-browser screenshot "captura.png"

# 7. Cerrar
agent-browser close --all
```

Detalles que ahorran tiempo:

- El primer `open` después de `close --all` puede tardar **minutos** en este
  equipo (arranque en frío del navegador). No está colgado.
- Para escribir texto hay que enfocar el campo primero:
  `agent-browser eval "document.getElementById('typingInput').focus()"` y luego
  `agent-browser keyboard type "texto"`.
- Si la app limita las pulsaciones por minuto (mecanografía: 300 ppm), teclea
  con pausas; si no, la base rechaza la marca por la restricción `check`.
- `agent-browser skills get core` imprime la referencia completa de comandos.

### 7.5 Verificar la base, no la UI

El mensaje «guardado» de la interfaz no prueba nada. Después de cada acción hay
que leer de vuelta, con una sesión distinta a la que escribió:

```powershell
$login = Invoke-RestMethod -Uri "$Url/rest/v1/rpc/login_student" -Method Post `
  -Headers $headers -Body '{"p_username":"prueba.agente","p_password":"PruebaSegura2026"}'
$tok = $login[0].auth_token

Invoke-RestMethod -Uri "$Url/rest/v1/rpc/get_progress" -Method Post `
  -Headers $headers -Body (@{ p_token = $tok } | ConvertTo-Json -Compress)
```

O directamente en el SQL Editor:

```sql
select * from mecanografia.lesson_progress order by last_practiced_at desc;
```

### 7.6 Una salida típica

```text
OK    token inválido rechazado (403 / 28000)
OK    registro de alumno
OK    duplicado rechazado (409 / 23505)
OK    contraseña corta rechazada
OK    login bcrypt
OK    contraseña incorrecta rechazada (403 / 28P01)
OK    tabla students cerrada a anon (401 / 42501)
OK    aislamiento entre alumnos
OK    logout revoca el token
FALLA top 10 sin token → devolvió datos
0 fallos de 10
```

---

## 8. Errores frecuentes y qué significan

| Código | HTTP | Significado | Solución |
|---|---|---|---|
| `PGRST106` | 406 | El esquema no está expuesto | Añadirlo en Exposed schemas |
| `PGRST205` | 404 | No encuentra la tabla en el esquema | Ejecutar el SQL / revisar el nombre |
| `PGRST202` | 404 | No encuentra la función con esos parámetros | Revisar firma y nombres de argumentos |
| `42501` | 401 | Sin permisos sobre la tabla | Correcto si es `anon`; no conceder |
| `28000` | 403 | Token inválido o caducado | Volver a iniciar sesión |
| `28P01` | 403 | Credenciales incorrectas | Mensaje genérico, no revelar |
| `23505` | 409 | Violación de unicidad | «Ese usuario ya existe» |
| `P0001` | 400 | `raise exception` propio | Es tu validación: mensaje tal cual |
| `53300` | 5xx | Bloqueo por intentos fallidos | Esperar 5 min o `reset_password` |

---

## 9. Anexo: script reutilizable

Guárdalo como `tools/supabase-smoke-test.ps1` y adáptalo a cada proyecto
(los nombres de RPC y de tabla son los de mecanografía; cámbialos).

```powershell
<#
  Batería mínima de comprobación de un esquema de Supabase.
  Uso:
    .\supabase-smoke-test.ps1 -Url https://xxx.supabase.co -Key sb_publishable_... -Schema mecanografia
#>
param(
  [Parameter(Mandatory = $true)][string]$Url,
  [Parameter(Mandatory = $true)][string]$Key,
  [Parameter(Mandatory = $true)][string]$Schema,
  [string]$Username = "prueba.agente",
  [string]$Password = "PruebaSegura2026"
)

$headers = @{
  apikey            = $Key
  Authorization     = "Bearer $Key"
  "Content-Type"    = "application/json"
  "Accept-Profile"  = $Schema
  "Content-Profile" = $Schema
}

$script:ok = 0
$script:ko = 0

function Rpc {
  param([string]$Name, [hashtable]$Body = @{})
  $json = $Body | ConvertTo-Json -Compress
  $r = Invoke-WebRequest -Uri "$Url/rest/v1/rpc/$Name" -Method Post `
    -Headers $headers -Body $json -UseBasicParsing -SkipHttpErrorCheck
  $data = $null
  if ($r.Content) { try { $data = $r.Content | ConvertFrom-Json } catch { $data = $r.Content } }
  [pscustomobject]@{ Status = [int]$r.StatusCode; Data = $data; Raw = $r.Content }
}

function Get0 {
  param([string]$Path)
  Invoke-WebRequest -Uri "$Url/rest/v1/$Path" -Headers $headers `
    -UseBasicParsing -SkipHttpErrorCheck
}

function Check {
  param([string]$Name, [bool]$Ok, [string]$Detail = "")
  if ($Ok) { $script:ok++; Write-Host "  OK    $Name" }
  else { $script:ko++; Write-Host "  FALLA $Name  $Detail" }
}

Write-Host "`n== Seguridad =="
$r = Get0 "students?select=*&limit=1"
Check "tablas cerradas a anon" ($r.StatusCode -eq 401) "HTTP $($r.StatusCode)"

$r = Rpc "get_me" @{ p_token = "00000000-0000-0000-0000-000000000000" }
Check "token inválido rechazado" ($r.Status -eq 403) "HTTP $($r.Status)"

$r = Rpc "get_sprint_leaderboard" @{}
Check "RPC sin token rechazada" ($r.Status -eq 404 -or $r.Status -eq 403) "HTTP $($r.Status)"

Write-Host "`n== Cuentas =="
$r = Rpc "register_student" @{ p_username = $Username; p_display_name = "Prueba"; p_password = $Password }
Check "registro" ($r.Status -eq 200 -and $r.Data[0].auth_token) "HTTP $($r.Status) $($r.Raw)"
if ($r.Status -ne 200) { exit 1 }
$token = $r.Data[0].auth_token

$r = Rpc "register_student" @{ p_username = $Username; p_display_name = "Otro"; p_password = $Password }
Check "duplicado rechazado" ($r.Status -eq 409) "HTTP $($r.Status)"

$r = Rpc "register_student" @{ p_username = "$Username.corto"; p_display_name = "Corto"; p_password = "1234567" }
Check "contraseña corta rechazada" ($r.Status -eq 400) "HTTP $($r.Status)"

$r = Rpc "login_student" @{ p_username = $Username; p_password = $Password }
Check "login correcto" ($r.Status -eq 200 -and $r.Data[0].auth_token) "HTTP $($r.Status)"
$token = $r.Data[0].auth_token

$r = Rpc "login_student" @{ p_username = $Username; p_password = "claveIncorrecta" }
Check "contraseña incorrecta rechazada" ($r.Status -eq 403) "HTTP $($r.Status)"

$r = Rpc "get_me" @{ p_token = $token }
Check "sesión válida" ($r.Status -eq 200) "HTTP $($r.Status)"

Write-Host "`n== Datos =="
$r = Rpc "record_lesson_result" @{
  p_token = $token; p_lesson_id = "test-1"; p_wpm = 30; p_accuracy = 97
  p_stars = 3; p_duration = 60; p_total_chars = 100; p_errors = 2
}
Check "guardar progreso" ($r.Status -eq 200) "HTTP $($r.Status) $($r.Raw)"

$r = Rpc "get_progress" @{ p_token = $token }
Check "leer progreso" ($r.Status -eq 200 -and $r.Data.Count -ge 1) "HTTP $($r.Status)"

$r = Rpc "get_random_sprint_text" @{ p_token = $token }
Check "texto de sprint" ($r.Status -eq 200 -and $r.Data[0].body) "HTTP $($r.Status)"

Write-Host "`n== Cierre =="
$r = Rpc "logout_student" @{ p_token = $token }
Check "logout" ($r.Status -eq 204 -or $r.Status -eq 200) "HTTP $($r.Status)"

$r = Rpc "get_me" @{ p_token = $token }
Check "token revocado" ($r.Status -eq 403) "HTTP $($r.Status)"

Write-Host "`n$($script:ok) correctas, $($script:ko) fallidas"
if ($script:ko -gt 0) { exit 1 }
```

> El script **crea una cuenta de prueba**. Borra al terminar:
>
> ```sql
> delete from mecanografia.students where username like 'prueba.%';
> ```

---

## 10. Bitácora: cómo se montó Mecanografía

1. **Diagnóstico del proyecto existente**: `public` tenía una `profiles` de otra
   app (columnas `id`, `created_at`), así que el `setup.sql` original habría
   ejecutado sin error y habría fallado después, al registrar al primer alumno.
   Lección: **comprobar si la tabla ya existe antes de confiar en
   `if not exists`**.
2. **Decisión**: esquema `mecanografia` + cuentas propias (sin Supabase Auth,
   porque no hay correos reales).
3. **SQL en una transacción** con bloque de verificación (6 tablas, 13
   funciones, 12 textos, 6 con RLS, 11 expuestas a `anon`).
4. **Primer error real**: faltaba exponer el esquema. La API lo dijo claro
   (`PGRST106`) y la app lo tradujo a un mensaje entendible.
5. **Batería REST**: 19 comprobaciones, incluidas las negativas. Todas pasaron.
6. **Interfaz**: login real, dos lecciones completadas, «Progreso guardado en tu
   cuenta», ranking con la marca del alumno.
7. **Limpieza**: borrar las cuentas `prueba.*` antes de dar el módulo a los
   alumnos.

### Decisiones que quedaron abiertas

- El `Backspace` no devuelve la precisión: corregir un error no mejora la nota.
- El registro está abierto: cualquiera con la URL puede crear cuenta.
- No hay panel de profesor: se consulta desde el Table Editor.

---

## 11. Referencias

- Esquemas personalizados: <https://supabase.com/docs/guides/api/using-custom-schemas>
- API keys: <https://supabase.com/docs/guides/api/api-keys>
- `supabase-js` con `db.schema`: <https://supabase.com/docs/reference/javascript/initializing>
- Códigos de error de PostgREST: <https://docs.postgrest.org/en/v12/references/errors.html>
