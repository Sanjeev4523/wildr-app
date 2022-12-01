export default () => ({
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT
    ? parseInt(process.env.DB_PORT, 10)
    : 5432,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  STRIPE_KEY: process.env.STRIPE_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
});
