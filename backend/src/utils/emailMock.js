import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Simple mock email sender that writes emails to disk as log files.
 * This is useful for development and demo environments without a real SMTP provider.
 */
export async function sendEmailMock({ to, subject, html }) {
  const logDir = path.isAbsolute(config.emailLogDir || '')
    ? config.emailLogDir
    : path.join(__dirname, '..', '..', config.emailLogDir || 'logs/emails');

  await fs.promises.mkdir(logDir, { recursive: true });

  const fileName = `${Date.now()}-${subject.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
  const filePath = path.join(logDir, fileName);

  const content = `
From: ${config.emailFrom || 'no-reply@sprintboard.local'}
To: ${to}
Subject: ${subject}

${html}
`;

  await fs.promises.writeFile(filePath, content, 'utf8');
}

