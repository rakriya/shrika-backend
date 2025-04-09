import jwt, { JwtPayload } from "jsonwebtoken";
import env from "../config/dotenv";
import prisma from "../config/prisma";

export const generateAccessToken = ({ payload }: { payload: JwtPayload }) => {
  const token = jwt.sign(payload, env.PRIVATE_KEY, {
    algorithm: "RS256",
    expiresIn: `${env.ACCESS_TOKEN_EXPIRY_MINUTES}Minutes`,
  });

  return token;
};

export const generateRefreshToken = ({ payload }: { payload: JwtPayload }) => {
  const token = jwt.sign(payload, env.REFRESH_JWT_SECRET_KEY, {
    algorithm: "HS256",
    expiresIn: `${env.REFRESH_TOKEN_EXPIRY_DAYS}days`,
    jwtid: String(payload.id),
  });

  return token;
};

export const saveRefreshToken = async ({
  userAgent,
  ipAddress,
  memberId,
}: {
  userAgent: string;
  ipAddress: string;
  memberId: string;
}) => {
  const newToken = await prisma.refreshToken.create({
    data: {
      memberId,
      userAgent,
      ipAddress,
      expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_EXPIRY_DAYS),
    },
  });

  return newToken;
};
