export function checkSetupSecret(providedSecret) {
  const real = process.env.SETUP_SECRET;
  if (!real) {
    throw new Error('El servidor no tiene configurada SETUP_SECRET');
  }
  if (!providedSecret || providedSecret !== real) {
    const err = new Error('Clave de configuración incorrecta');
    err.statusCode = 401;
    throw err;
  }
}
