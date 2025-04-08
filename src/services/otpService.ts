import redis from "../config/redis";
import { OTP_STATUS, OtpPurpose, OtpStatus } from "../constants";

export const findOtp = async ({
  phoneNumber,
  memberId,
  societyId,
  purpose,
}: {
  phoneNumber?: string;
  memberId?: string;
  societyId: string;
  purpose: OtpPurpose;
}): Promise<{ otp: string; purpose: OtpPurpose; status: OtpStatus }> => {
  const key = `otp:${purpose}:${phoneNumber || memberId}:${societyId}`;
  const data = await redis.get(key);

  if (!data) throw new Error("OTP expired or not found");

  const foundOtp = JSON.parse(data);

  return foundOtp;
};

export const updateOtpStatus = async ({
  phoneNumber,
  memberId,
  societyId,
  purpose,
}: {
  phoneNumber?: string;
  memberId?: string;
  societyId: string;
  purpose: OtpPurpose;
}) => {
  const key = `otp:${purpose}:${phoneNumber || memberId}:${societyId}`;
  const data = await redis.get(key);

  if (!data) throw new Error("OTP expired or not found");

  // Mark as used
  await redis.set(key, JSON.stringify({ ...JSON.parse(data), status: OTP_STATUS.USED }));

  return;
};
