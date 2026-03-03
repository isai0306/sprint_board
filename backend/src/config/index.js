import dotenv from 'dotenv';

dotenv.config();

const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  corsOrigins,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sprint_board'
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_secret_change_me',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h'
  },
  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10)
  },
  emailFrom: process.env.EMAIL_FROM || 'Sprint Board <no-reply@sprintboard.local>',
  emailLogDir: process.env.EMAIL_LOG_DIR || 'logs/emails'
};

