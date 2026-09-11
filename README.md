# Minuta Ultrasonido — cuentas, equipos, y compromisos asignados por persona

Cada persona entra con su propio usuario y contraseña. Los compromisos ya no
pertenecen a "un equipo" completo — se **asignan a personas específicas**
(una o varias). Cada quien ve exactamente:

- Lo que **le asignaron a ella/él**.
- Lo que **ella/él le asignó a otras personas**.

Esto arma la jerarquía sola: si alguien de tu equipo tiene su propio grupo y
le asigna algo a su gente, tú no lo ves (no es asunto tuyo) — pero esa
persona sí ve ambos lados. Y si alguien pertenece a varios grupos, ve todo lo
que le hayan asignado desde cualquiera de ellos.

## Variables de entorno

En Vercel → Settings → Environment Variables:

| Nombre | Para qué |
|---|---|
| `KV_REDIS_URL` | Conexión a tu base de datos (ya la tenías) |
| `SESSION_SECRET` | Firma las cookies de sesión (ya la tenías) |
| `SETUP_SECRET` | Clave para entrar a `/setup` — solo tú la conoces |
| `LEGACY_ADMIN_USERNAME` | (Opcional) el usuario al que se le habilita el botón "Importar compromisos iniciales" |

## Primeros pasos

1. Sube este código a tu repo, como siempre.
2. Entra a `tu-app.vercel.app/setup` con tu `SETUP_SECRET`.
3. **"1. Crear un equipo nuevo"** — crea tu propia cuenta (ej. usuario
   `miguel`) y la de la otra jefa. Dale a cada una el nombre de equipo que
   quieras (es solo una etiqueta). Dejando marcada la casilla, ambas podrán
   crear y administrar su propio equipo desde dentro de la app.
4. **"2. Agregar una persona"** — agrega a cada subordinado(a) al equipo que
   corresponda.
5. **"4. Migrar los compromisos antiguos"** — escribe tu usuario (ej.
   `miguel`) para que los compromisos que ya tenías queden asignados a ti.
   Después, desde la app, edítalos para repartirlos a quien corresponda.

## Cómo se usa día a día

- **Agregar un compromiso**: eliges "Asignado a" con casillas — puedes
  marcar una o varias personas de tu equipo. Todas las que marques podrán
  verlo y darle seguimiento.
- **Mi equipo** (dentro de "Configuración", solo visible si tienes el
  permiso): ahí creas tu equipo si no lo tienes, agregas gente nueva, o
  agregas a alguien que ya tiene cuenta en otro equipo (para que también
  pueda recibir compromisos tuyos).
- **Dar el permiso de crear equipo a alguien más tarde**: en `/setup`,
  sección **"5. Dar o quitar el permiso de crear equipo"** — así, si una de
  tus subordinadas necesita armar su propio grupo, tú se lo habilitas ahí una
  vez, y de ahí en adelante ella lo maneja sola desde "Configuración".
- **Perfil**: cada quien cambia su nombre, foto y contraseña desde
  "Configuración".
- **Exportar**: cada quien descarga en Excel solo lo que puede ver.

## `/setup` sigue disponible como respaldo

No aparece en ningún menú — solo tú la usas, para restablecer una contraseña
de emergencia, revisar todos los equipos existentes, o dar/quitar el permiso
de crear equipo.

## Desarrollo local (opcional)

```bash
npm install
vercel env pull .env.local
npm run dev
```

## Notas técnicas

- Las contraseñas se guardan con hash seguro (bcrypt).
- Cada compromiso guarda quién lo creó (`assignedBy`) y a quién se asignó
  (`assignedTo`, un arreglo). La visibilidad se calcula con esos dos campos
  en cada consulta — no hay una tabla separada por equipo que se pueda
  desincronizar.
- Una persona puede pertenecer a varios equipos (grupos) a la vez, cada uno
  con su propio rol (administrador o miembro) — eso vive en
  `user:{username}:groups` en Redis.
- El campo "Responsable" que ves en las tarjetas y en el Excel exportado es
  un texto generado automáticamente a partir de los nombres de
  "Asignado a" — no lo edites directamente en el Excel, solo sirve para
  mostrar/filtrar.
