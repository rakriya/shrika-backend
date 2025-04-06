const MAX_FILE_SIZE_LIMITS: { [key: string]: number } = {
  "image/jpeg": 5 * 1024 * 1024, // 5MB
  "image/png": 5 * 1024 * 1024, // 5MB
  "application/pdf": 10 * 1024 * 1024, // 10MB
  "video/mp4": 100 * 1024 * 1024, // 100MB
  "video/mpeg": 100 * 1024 * 1024, // 100MB
  "video/quicktime": 100 * 1024 * 1024, // 100MB
};
const ALLOWED_MIMETYPES = Object.keys(MAX_FILE_SIZE_LIMITS);
const MAX_NUMBER_FILE = 15;

const ALLOWED_PERMISSIONS = [
  "read_members",
  "update_members",
  "delete_members",
  "manage_loans",
  "view_reports",
] as const;

export type Permission = (typeof ALLOWED_PERMISSIONS)[number];

const SALT_ROUNDS = 10;

export {
  ALLOWED_MIMETYPES,
  MAX_FILE_SIZE_LIMITS,
  MAX_NUMBER_FILE,
  ALLOWED_PERMISSIONS,
  SALT_ROUNDS,
};
