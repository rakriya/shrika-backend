import { ALLOWED_PERMISSIONS, Permission } from "../constants";

export const isValidPermissions = (input: string[]): input is Permission[] => {
  return input.every((p) => ALLOWED_PERMISSIONS.includes(p as Permission));
};
