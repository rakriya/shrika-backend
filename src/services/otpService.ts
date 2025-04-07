import { OTP_EXPIREY_IN_MINUTES, OTP_STATUS, OtpPurpose, OtpStatus } from "../constants";
import { generateOtp } from "../utils/generateOtp";
import redis from "../config/redis";

export const createOtp = async ({
  phoneNumber,
  memberId,
  purpose,
}: {
  phoneNumber?: string;
  memberId?: string;
  purpose: OtpPurpose;
}) => {
  const otp = generateOtp();

  const key = `otp:${purpose}:${phoneNumber || memberId}`;
  const value = JSON.stringify({
    otp,
    purpose,
    status: OTP_STATUS.UNUSED,
  });

  await redis.set(key, value, "EX", OTP_EXPIREY_IN_MINUTES * 60);

  return otp;
};

export const findOtp = async ({
  phoneNumber,
  memberId,
  purpose,
}: {
  phoneNumber?: string;
  memberId?: string;
  purpose: OtpPurpose;
}): Promise<{ otp: string; purpose: OtpPurpose; status: OtpStatus }> => {
  const key = `otp:${purpose}:${phoneNumber || memberId}`;
  const data = await redis.get(key);

  if (!data) throw new Error("OTP expired or not found");

  const foundOtp = JSON.parse(data);

  return foundOtp;
};

export const updateOtpStatus = async ({
  phoneNumber,
  memberId,
  purpose,
}: {
  phoneNumber?: string;
  memberId?: string;
  purpose: OtpPurpose;
}) => {
  const key = `otp:${purpose}:${phoneNumber || memberId}`;
  const data = await redis.get(key);

  if (!data) throw new Error("OTP expired or not found");

  // Mark as used
  await redis.set(key, JSON.stringify({ ...JSON.parse(data), status: OTP_STATUS.USED }));

  return;
};
