# MecaSamType Web

Entrenador de mecanografía en español para los alumnos del Instituto Nueva
Tecnología. Es la evolución web de **MecaSamType** de escritorio y se integra en
el portal de Ofimática como módulo **09 Mecanografía**.

## Qué incluye

- 17 lecciones guiadas en español, organizadas en 5 unidades y desbloqueadas por
  progreso. Cada texto tiene entre 590 y 670 caracteres (aprox. 10-12 líneas),
  para que el WPM y el cronómetro sean representativos.
- Teclado virtual con distribución **español ES**, colores por dedo y pista de
  la siguiente tecla, incluyendo `Shift`, `AltGr` y tildes.
- Motor de tecleo con WPM, precisión, errores, pausa, reanudación y corrección
  con `Backspace`.
- Sprint competitivo de **60 segundos** con texto aleatorio de Supabase y Top 10
  público del grupo.
- Progreso privado por alumno, guardado en Supabase.
- **Cuentas propias** con usuario y contraseña: sin correo electrónico y sin
  Supabase Auth.
- Contraseñas guardadas con **bcrypt**, nunca en texto plano.
- Modo demo automático mientras Supabase no esté configurado.

## Estructura

```text
mecanografia/
├─ index.html              Interfaz y pantallas
├─ css/app.css             Sistema visual completo
├─ js/
│  ├─ app.js               Arranque, rutas, autenticación y acciones
│  ├─ api.js               Adaptadores Supabase y demo
│  ├─ config.js            Credenciales y constantes
│  ├─ engine.js            Motor de tecleo
│  ├─ keyboard.js          Teclado ES visual
│  ├─ ui.js                Utilidades y ranking
│  ├─ views.js             Dashboard, lección y resultado
│  ├─ sprint-views.js      Sprint y ranking
│  └─ data/                Lecciones y textos locales
├─ sql/setup.sql           Esquema `mecanografia`, cuentas, RPC y textos
└─ README.md
```

No hay framework, compilación ni `npm install`. Solo se carga
`@supabase/supabase-js` desde un CDN cuando hay credenciales configuradas.

---

## 1. Crear el proyecto en Supabase

1. Entra en <https://supabase.com> y crea un proyecto.
2. Guarda la **Project URL** y la **anon public key** desde
   `Project Settings → API`.
3. **No uses nunca la `service_role` key en el navegador.**

## 2. Ejecutar el SQL

1. Abre `SQL Editor → New query`.
2. Copia **todo** el contenido de [`sql/setup.sql`](sql/setup.sql).
3. Pulsa `Run`.

El script crea el esquema **`mecanografia`** (separado de las demás apps del
proyecto) con:

- `students`: usuario, nombre visible y hash bcrypt de la contraseña.
- `sessions`: tokens de sesión de 60 días.
- `lesson_progress`: mejores marcas privadas por lección.
- `practice_sessions`: historial privado de prácticas.
- `sprint_texts`: textos del sprint.
- `sprint_runs`: marcas del sprint.
- Las funciones RPC de registro, acceso, progreso y ranking.
- 12 textos iniciales para el sprint.

Todo va dentro de una transacción: **si una línea falla, no se crea nada**. Se
puede volver a ejecutar sin borrar datos.

Al final del archivo hay un bloque de **verificación**. Su resultado esperado es:

```text
tablas            6
funciones        13
textos           12
rls               6
expuestas_a_anon 11
```

Si los números no cuadran, algo no se ejecutó.

## 3. Exponer el esquema en la API

Este paso es obligatorio y es el que más se olvida:

1. Ve a `Project Settings → API` (en el panel nuevo: `Data API → Settings`).
2. En **Exposed schemas**, añade `mecanografia`.
3. Guarda y espera unos segundos.

Sin esto, la app muestra: *«El esquema «mecanografia» no está en «Exposed
schemas»»*.

## 4. Configurar la app

Abre `js/config.js` y rellena:

```js
export const SUPABASE_URL = "https://TU-PROYECTO.supabase.co";
export const SUPABASE_ANON_KEY = "TU_ANON_PUBLIC_KEY";
```

Con esos dos valores, `IS_CONFIGURED` pasa a `true` y la app usa Supabase. Si
están vacíos, se activa el modo demo.

La `anon public key` es pública por diseño. La seguridad real la dan las
funciones `SECURITY DEFINER` y los tokens de sesión.

## 5. Publicar en el portal

La app ya está enlazada desde la tarjeta **09 Mecanografía** de
`vanilla-blog-ofimatica/index.html`.

Como usa módulos ES, no la abras con doble clic (`file://`). Sirve la carpeta
por HTTP. Por ejemplo, desde la raíz del portal:

```bash
python -m http.server 8123
```

Y visita:

```text
http://localhost:8123/mecanografia/
```

En producción funcionará en:

```text
https://ofimatica.samydex.cv/mecanografia/
```

## 6. Modo demo

Con `SUPABASE_URL` y `SUPABASE_ANON_KEY` vacíos:

- La pantalla de acceso muestra **Entrar en modo demo**.
- El progreso se guarda en `localStorage` con la clave
  `mecasamtype.demo.v2`.
- El ranking usa rivales de ejemplo.
- No se envía nada a ningún servidor.

También se puede abrir directamente con:

```text
mecanografia/?demo=1
```

Para reiniciar los datos demo, borra esa clave desde
`DevTools → Application → Local Storage`.

---

## Cómo funciona la seguridad

No se usa Supabase Auth porque las cuentas no tienen correo real. El modelo es:

1. **Registro**: `register_student` valida los datos, calcula el hash con
   `crypt(p_password, gen_salt('bf', 10))` y crea el alumno.
2. **Acceso**: `login_student` compara con bcrypt y devuelve un **token**
   aleatorio de 122 bits que el navegador guarda en `localStorage`.
3. **Cada petición**: el token viaja como argumento `p_token`; la función
   `touch_session` lo valida, lo renueva 60 días y devuelve el alumno.
4. **Base de datos**: `anon` no tiene permisos sobre ninguna tabla. Las tablas
   tienen RLS activo y **sin políticas**. Solo se pueden ejecutar las RPC
   marcadas en el SQL.

Además:

- 5 intentos fallidos seguidos bloquean la cuenta 5 minutos.
- El login hace trabajo de bcrypt aunque el usuario no exista, para no delatar
  por tiempo qué usuarios hay.
- `reset_password` no está concedida a `anon`: solo se puede usar desde el SQL
  Editor.

### Límites conocidos de este modelo

- **El registro está abierto**: cualquiera con la URL puede crear una cuenta.
- No hay recuperación por correo: el profesor restablece la contraseña.
- El token vive en `localStorage`, así que un XSS podría robarlo. Es el mismo
  riesgo que tiene cualquier sesión web sin cookies `HttpOnly`.
- Si algún día necesitas verificación de identidad real, toca migrar a Supabase
  Auth. Este diseño está pensado para un aula, no para banca.

---

## Uso para el alumno

1. Entra en la tarjeta **09 Mecanografía** del portal.
2. Pulsa **Crear cuenta**.
3. Elige un usuario (3–24 caracteres: minúsculas, números, `.`, `_` o `-`) y una
   contraseña de **al menos 8 caracteres**.
4. Escribe su nombre visible, que será el que aparezca en el ranking.
5. Completa las lecciones en orden. Cada lección desbloquea la siguiente.
6. Cuando quiera competir, abre **Sprint** y pulsa **Empezar sprint**.

### Privacidad

- El progreso de las lecciones es privado: solo lo ve el alumno con su token.
- El ranking del sprint muestra únicamente nombre visible, WPM, precisión,
  caracteres y fecha.
- No se guarda ningún correo electrónico: no existe.

### Puntuación

- **ppm/WPM**: caracteres correctos ÷ 5 ÷ minutos.
- **Precisión**: caracteres correctos ÷ caracteres escritos.
- **Estrellas de lección**:
  - 1 estrella por completar.
  - 2 estrellas al alcanzar la precisión objetivo.
  - 3 estrellas al alcanzar precisión y velocidad objetivo.

## Consultar el progreso como profesor

No hay panel de administración. Usa el Table Editor de Supabase, eligiendo el
esquema **`mecanografia`**:

- `students`: alumnos registrados.
- `lesson_progress`: progreso por lección.
- `practice_sessions`: historial de prácticas.
- `sprint_runs`: marcas del sprint.
- `sprint_texts`: textos disponibles.

O directamente en el SQL Editor:

```sql
select username, display_name, created_at, last_login_at
  from mecanografia.students
 order by created_at desc;

select * from mecanografia.lesson_progress order by last_practiced_at desc;

select username, wpm, accuracy, chars, created_at
  from mecanografia.sprint_runs
 order by wpm desc
 limit 10;
```

### Restablecer una contraseña

```sql
select mecanografia.reset_password('ana.lopez', 'nuevaClave123');
```

Cierra todas sus sesiones: deberá entrar con la nueva.

### Desactivar o borrar a un alumno

```sql
-- Desactivar (no puede entrar, pero conserva sus datos)
update mecanografia.students set is_active = false where username = 'ana.lopez';

-- Volver a activar
update mecanografia.students set is_active = true where username = 'ana.lopez';

-- Borrar definitivamente (arrastra su progreso y sus marcas)
delete from mecanografia.students where username = 'ana.lopez';
```

### Cambiar el texto de una lección

Edita el campo `text` de la lección en `js/data/lessons.js`:

- Mantén el mismo `id` (`u1-l1`, `u5-l4`, etc.) para conservar el progreso ya
  guardado en Supabase, porque ese id es la clave.
- Usa solo las teclas que la lección ya presentó. La progresión es acumulativa:
  `u1` trabaja fila guía y primeras letras; `u2` completa el teclado; `u3` añade
  números y símbolos; `u4`, la ñ, tildes y signos; `u5`, textos libres.
- Apunta a 590-670 caracteres por texto (unas 10-12 líneas). Un texto demasiado
  corto hace que el cronómetro y el cálculo de WPM sean poco representativos.
- No insertes saltos de línea (`\n`): el motor ignora `Enter` y el texto se
  acomoda solo dentro del panel de práctica.
- Los acentos, la ñ, `¿`, `¡` y las comillas se escriben con la tecla muerta o
  `Shift`; el motor ya los compara normalizados.

### Cambiar o añadir textos del sprint

Edita `mecanografia.sprint_texts` en el Table Editor. El cuerpo debe tener entre
120 y 1200 caracteres y el título es único.

## Cambiar la duración del sprint

1. En `js/config.js`, cambia `SPRINT_SECONDS`.
2. En `sql/setup.sql`, actualiza el `60` de `submit_sprint_run`.

La competición está pensada para 60 segundos.

## Solución de problemas

**«El esquema «mecanografia» no está en «Exposed schemas»»**
: Añádelo en `Project Settings → API → Exposed schemas` y espera unos segundos.

**«Falta ejecutar sql/setup.sql»**
: El esquema existe pero no las tablas/funciones. Vuelve a ejecutar el archivo
  completo y mira el bloque de verificación del final.

**«Ese usuario ya existe»**
: El nombre de usuario es único. Entra con él o elige otro.

**«Tu sesión ha caducado»**
: Han pasado más de 60 días sin usar la cuenta, o el profesor restableció la
  contraseña. Vuelve a entrar.

**«Demasiados intentos fallidos»**
: Bloqueo de 5 minutos tras 5 fallos. También se quita con `reset_password`.

**«No se pudo cargar el ranking»**
: Revisa que ejecutaste el SQL y que el esquema está expuesto.

**El teclado no responde**
: Haz clic en el texto o pulsa **Empezar a escribir**. El campo de tecleo es un
`input` oculto para que los acentos compuestos y la `ñ` funcionen correctamente.

**Quiero volver al modo demo**
: Vacía `SUPABASE_URL` y `SUPABASE_ANON_KEY` en `js/config.js`.

**La contraseña no se puede recuperar por correo**
: No hay correo. Usa `mecanografia.reset_password(...)` desde el SQL Editor.

## Notas técnicas

- Distribución de teclado: español ES.
- El motor escucha `input` para admitir tildes y diéresis compuestas, y
  `keydown` para `Backspace` y `Escape`.
- El cronómetro del sprint no se detiene al perder el foco.
- El cronómetro de las lecciones se pausa al perder el foco o cambiar de
  pestaña.
- El SDK de Supabase se carga como módulo ESM desde jsDelivr.
- La app no usa Realtime: el progreso se carga al entrar y el ranking se
  refresca al terminar el sprint.
- Los iconos son SVG. No se usan emojis en la interfaz.
