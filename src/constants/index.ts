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
  "create_member",
  "read_members",
  "update_members",
  "delete_members",
  "manage_loans",
  "view_reports",
] as const;

export type Permission = (typeof ALLOWED_PERMISSIONS)[number];

const SALT_ROUNDS = 10;

const OTP_PURPOSE = {
  LOGIN: "login",
  RESET_PASSWORD: "reset_password",
  FORGOT_PASSWORD: "forgot_password",
} as const;

const OTP_STATUS = {
  USED: "used",
  UNUSED: "unused",
} as const;

export type OtpPurpose = (typeof OTP_PURPOSE)[keyof typeof OTP_PURPOSE];
export type OtpStatus = (typeof OTP_STATUS)[keyof typeof OTP_STATUS];

const OTP_LENGTH = 6;
const OTP_EXPIREY_IN_MINUTES = 15;
const OTP_CONTENT = "01234567879";

const OTP_BODY = `Your OTP code is: $otp | This code is valid for $duration minutes.`;
// const OTP_BODY = `🔐 Shrika CRM OTP Verification

// Your OTP code is: $otp
// This code is valid for $duration minutes. Don’t share with anyone.

// If you didn’t request this, please ignore this message.`;

const COOKIE_REFRESH_TOKEN_NAME = "shrika-refresh-token";
const COOKIE_ACCESS_TOKEN_NAME = "shrika-access-token";

const TRAIL_LIMIT = 15; // days
const GRACE_PERIOD_DAYS = 7; // days
const MANDATE_EXPIRY_DAYS = 7; // days
const SUBSCRIPTION_DURATION_MONTHS = 12 * 12; // days

const SOCIETY_STATUS = {
  CREATED: "created",
  TRAIL: "trail",
  SUBSCRIPTION_FAILED: "subscription_failed",
  ACTIVE: "active",
  INACTIVE: "inactive",
  GRACE: "grace",
  BLOCKED: "blocked",
} as const;

const SUBSCRIPTION_STATUS = {
  CREATED: "created",
  AUTHENTICATED: "authenticated",
  ACTIVE: "active",
  HALTED: "halted",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  EXPIRED: "expired",
} as const;

const SUBSCRIPTION_PAYMENT_STATUS = {
  SUCCESS: "success",
  FAILED: "failed",
} as const;

export type SocietyStatus = (typeof SOCIETY_STATUS)[keyof typeof SOCIETY_STATUS];
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];
export type SubscriptionPaymentStatus =
  (typeof SUBSCRIPTION_PAYMENT_STATUS)[keyof typeof SUBSCRIPTION_PAYMENT_STATUS];

export {
  ALLOWED_MIMETYPES,
  MAX_FILE_SIZE_LIMITS,
  MAX_NUMBER_FILE,
  ALLOWED_PERMISSIONS,
  SALT_ROUNDS,
  OTP_PURPOSE,
  OTP_STATUS,
  OTP_LENGTH,
  OTP_CONTENT,
  OTP_EXPIREY_IN_MINUTES,
  OTP_BODY,
  COOKIE_ACCESS_TOKEN_NAME,
  COOKIE_REFRESH_TOKEN_NAME,
  TRAIL_LIMIT,
  SUBSCRIPTION_DURATION_MONTHS,
  MANDATE_EXPIRY_DAYS,
  SOCIETY_STATUS,
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_PAYMENT_STATUS,
  GRACE_PERIOD_DAYS,
};
