import { Request } from "express";
import { Role, Member, RefreshToken } from "@prisma/client";

export interface IAuthRequest extends Request {
  member: Member & { role: Role | null };
}

export interface IRefreshTokenParse extends Request {
  refreshTokenEntity: RefreshToken;
}

export interface IRazorpayRequest extends Request {
  razorpay: { eventId: string };
}
