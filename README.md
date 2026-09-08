# Minuta Ultrasonido — App web con contraseña (sin Google)

Esta versión NO usa Google Sheets ni credenciales de Google. Los datos de la
minuta se guardan en una base de datos **Redis** conectada a tu proyecto de
Vercel (por ejemplo, vía la integración de Redis Cloud del Marketplace de
Vercel). Todo lo demás (login con contraseña, modo editor, filtros, historial
de avances) funciona igual que en las versiones anteriores.

## Qué necesitas antes de empezar

1. Una cuenta de **GitHub** (gratis).
2. Una cuenta de **Vercel** (gratis, puedes entrar con tu cuenta de GitHub en vercel.com).

No se requiere ninguna cuenta ni credencial de Google.

## Paso 1 — Subir el proyecto a GitHub

```bash
git init
git add .
git commit -m "Primera versión de la minuta web (sin Google)"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

## Paso 2 — Desplegar en Vercel

1. Entra a https://vercel.com → **"Add New… → Project"** → elige tu repositorio.
2. Antes de darle **Deploy**, abre **"Environment Variables"** y agrega:

   | Nombre | Valor |
   |---|---|
   | `VIEW_PASSWORD` | La contraseña para **ver** la minuta |
   | `EDIT_PASSWORD` | La contraseña para poder **editar** |
   | `SESSION_SECRET` | Una cadena larga y aleatoria (`openssl rand -hex 32`) |

   (No agregues nada de Redis todavía, eso es el siguiente paso.)
3. Haz clic en **Deploy**.

## Paso 3 — Conectar la base de datos Redis

1. Dentro de tu proyecto en Vercel, ve a la pestaña **"Storage"**.
2. Crea o conecta una base de datos de tipo **Redis** (por ejemplo, la
   integración de Redis Cloud) a este proyecto.
3. Al conectarla, Vercel agrega automáticamente una variable con la cadena de
   conexión, normalmente `KV_REDIS_URL` (con el formato
   `redis://default:contraseña@host:puerto`). El código ya busca esa
   variable — si tu integración la nombra distinto (`REDIS_URL`, `KV_URL`),
   también la detecta automáticamente.
4. **Importante:** todas las variables relacionadas con Redis deben estar
   marcadas para los tres entornos — **Production, Preview y Development** —
   en Settings → Environment Variables. Si solo están en "Production" y
   pruebas la app desde una URL de preview, no las va a encontrar.
5. Ve a **"Deployments"** y dale **"Redeploy"** al último deployment para que
   tome la nueva variable.

## Cómo funciona la protección con contraseña

- Cualquiera que entre a la URL será mandado a una pantalla de login.
- Con solo la **contraseña de acceso** (`VIEW_PASSWORD`) entra en modo **solo lectura**.
- Con la **contraseña de edición** (`EDIT_PASSWORD`) además, entra en modo
  **editor** y puede agregar compromisos, cambiar estados y registrar avances.
- La sesión se guarda en una cookie firmada (nadie puede falsificarla sin
  conocer `SESSION_SECRET`) y dura 30 días. El botón **"Salir"** la cierra.

## Migrar tus compromisos actuales (un clic, sin instalar nada)

Este proyecto ya trae, en `scripts/import-data.json`, tus compromisos actuales
(convertidos desde tu Excel/Google Sheet), incluyendo el historial de avances.

1. Entra a tu app y haz login con la **contraseña de edición**.
2. Si la minuta está vacía, vas a ver un aviso arriba de la lista:
   **"Importar compromisos iniciales"**. Dale clic.
3. Listo — se cargan todos de un solo golpe. El aviso desaparece solo después.

Es seguro: si por error le das clic dos veces, o ya hay compromisos cargados,
no duplica nada — simplemente no hace nada la segunda vez.

### Alternativa con Node (opcional, si tienes permisos para instalarlo)

Para cargarlos a Redis desde tu computadora, después de completar los Pasos 1-3 de arriba:

1. Instala la CLI de Vercel si no la tienes: `npm i -g vercel`
2. Dentro de la carpeta del proyecto:
   ```bash
   npm install
   vercel link              # conecta esta carpeta con tu proyecto en Vercel
   vercel env pull .env.local
   node scripts/import.js
   ```
3. Deberías ver: `Listo: se importaron 44 compromisos. next_id quedó en 44.`
4. Entra a tu URL y confirma que aparecen todos los compromisos.

El script no borra ni duplica nada si lo corres por error una segunda vez —
se niega a importar si ya hay datos guardados. Si necesitas reimportar desde
cero, borra las claves `compromisos` y `next_id` desde el dashboard de tu base
de datos Redis, y vuelve a correr el script.

## Desarrollo local (opcional)

```bash
npm install
vercel env pull .env.local   # trae las variables reales del proyecto en Vercel
npm run dev
```

Abre http://localhost:3000

## Exportar a Excel

Cualquiera con acceso a la minuta (modo lectura o edición) puede descargar el
estado actual con el botón **"Exportar a Excel"** en la barra de filtros. Se
descarga un `.xlsx` con la misma estructura que el Excel original: una hoja
con los compromisos y otra hoja "Historial" con todos los avances.

## Notas

- El catálogo de áreas/responsables/estados está en `lib/store.js` (constante
  `CATALOGO`) — edítalo ahí si cambian tus equipos o áreas.
- Si ves el error "fetch failed" al cargar la minuta, casi siempre significa
  que la variable de conexión a Redis no está disponible en el entorno donde
  estás probando (ver Paso 3, punto 4) o que falta el Redeploy después de
  conectar la base de datos.
