# Minuta Ultrasonido — con cuentas por persona y equipos separados

Cada persona entra con su propio usuario y contraseña. Puede haber varios
**equipos** completamente aislados entre sí (por ejemplo, tu equipo y el de
otra jefa) — nadie ve ni edita los compromisos de un equipo que no es el
suyo, ni siquiera el operador de la app.

## Qué necesitas

1. Una cuenta de **GitHub** y una de **Vercel** (ya las tienes).
2. Una base de datos **Redis** conectada al proyecto (ya la tienes).

## Paso 1 — Variables de entorno nuevas

En Vercel → Settings → Environment Variables, agrega (además de las que ya
tenías: `KV_REDIS_URL`, `SESSION_SECRET`):

| Nombre | Valor |
|---|---|
| `SETUP_SECRET` | Una clave larga y secreta que **solo tú** vas a usar para crear cuentas |

Puedes **borrar** `VIEW_PASSWORD` y `EDIT_PASSWORD` — ya no se usan.

Marca todas las variables para **Production, Preview y Development**, y
vuelve a desplegar (Redeploy) para que tomen efecto.

## Paso 2 — Sube este código

Reemplaza el contenido de tu repositorio de GitHub con los archivos de este
proyecto, como has hecho antes.

## Paso 3 — Crea tu equipo desde /setup

1. Entra a `https://tu-app.vercel.app/setup`
2. Escribe tu `SETUP_SECRET`.
3. En **"1. Crear un equipo nuevo"**, crea tu propio equipo (ej. nombre
   "Equipo de Miguel", tu usuario y contraseña). Anota el **id del equipo**
   que te muestra el mensaje de confirmación (ej. `equipo-de-miguel`).
4. Repite lo mismo para la otra jefa: un equipo nuevo con su propio usuario y
   contraseña de administradora.
5. Con **"2. Agregar una persona a un equipo existente"**, agrega ahí a cada
   subordinado(a), eligiendo a qué equipo pertenece.

## Paso 4 — Recupera tus compromisos actuales

Como ya tenías compromisos cargados desde antes (los que ves en tu app hoy),
usa la opción **"4. Migrar los compromisos antiguos a un equipo"** en
`/setup`, seleccionando **tu propio equipo** como destino. Esto copia
exactamente lo que tienes guardado ahorita mismo (no una copia vieja) hacia
tu equipo nuevo.

Solo hazlo una vez, y solo para tu equipo — el de la otra jefa empieza vacío,
ya que nunca ha tenido datos.

## Paso 5 (opcional) — Habilitar el botón "Importar compromisos iniciales"

Si en vez del Paso 4 prefieres usar el botón dentro de la app (que carga una
foto fija de tus 45 compromisos originales tomada en un momento anterior, no
tus datos más recientes), agrega la variable `LEGACY_TEAM_ID` en Vercel con
el id de tu equipo, y vuelve a desplegar. **No recomendado si ya usaste el
Paso 4** — haría lo mismo pero con datos potencialmente desactualizados.

## Cómo entra cada quien

- Cada persona va a la URL normal de la app y entra con **su usuario y
  contraseña** (no más contraseñas compartidas).
- Ve únicamente los compromisos de su propio equipo — en la lista, el
  calendario, los reportes y las exportaciones.
- Cualquiera (administrador o miembro) puede agregar y editar compromisos de
  su equipo.
- Desde **"Configuración"**, cada quien cambia su nombre, foto de perfil y
  contraseña.
- El responsable de cada compromiso ahora se elige entre los miembros reales
  de ese equipo (ya no es una lista fija de nombres).

## Agregar personas o restablecer contraseñas después

Vuelve a `/setup` cuando lo necesites:

- **"2. Agregar una persona"** para dar de alta a alguien nuevo en un equipo.
- **"3. Restablecer una contraseña"** si alguien la olvidó.

Nadie más ve esta página — no aparece en ningún menú, y sin la clave
`SETUP_SECRET` no deja hacer nada.

## Exportar a Excel

Sigue funcionando igual, con el botón "Exportar" — pero ahora cada quien
descarga solo los compromisos de su propio equipo.

## Desarrollo local (opcional)

```bash
npm install
vercel env pull .env.local
npm run dev
```

## Notas técnicas

- Las contraseñas se guardan con hash seguro (bcrypt), nunca en texto plano.
- Los datos de cada equipo viven bajo claves separadas en Redis
  (`team:{id}:compromisos`, `team:{id}:next_id`), así que un error de
  filtrado no puede mezclar accidentalmente los datos de dos equipos.
- El catálogo de "áreas" y "estados" sigue siendo el mismo para todos los
  equipos — puedes editarlo en `lib/store.js` (constante `CATALOGO_BASE`) si
  hace falta.
