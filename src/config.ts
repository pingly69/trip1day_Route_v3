export const CONFIG = {
  TIMEZONE: 'Asia/Bangkok',
  DEFAULT_PASSCODE_HASH: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', // sha256 of 'admin123'
  TRANSACTION_STATUS: {
    DRAFT: 'DRAFT',
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
  },
} as const;

export interface Env {
  IMG_DB: D1Database;
  DB?: D1Database;
  admin_password?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_PASSCODE_HASH?: string;
  TIMEZONE?: string;
  ASSETS?: Fetcher;
}
