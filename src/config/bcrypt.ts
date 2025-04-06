// bcrypt-wrapper.ts
import env from "./dotenv";

export async function getBcrypt() {
  if (env.NODE_ENV === "production") {
    return await import("bcrypt");
  } else {
    return await import("bcryptjs");
  }
}
