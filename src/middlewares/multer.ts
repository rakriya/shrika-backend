import type { Express, NextFunction, RequestHandler } from "express";
import multer from "multer";
import { ALLOWED_MIMETYPES, MAX_FILE_SIZE_LIMITS, MAX_NUMBER_FILE } from "../constants";
import createHttpError from "http-errors";

// File type filter
const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
    cb(new Error("Invalid file type. Only JPEG, PNG, CSV, MP4 and PDF are allowed."));
  }

  cb(null, true);
};

// Create common uploader
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { files: MAX_NUMBER_FILE },
});

// 🔁 Unified function for all types
export const commonUploader = (
  mode: "single" | "multiple" | "fields",
  field: string | { name: string; maxCount: number }[],
  maxCount = 15,
): RequestHandler => {
  if (mode === "single" && typeof field === "string") {
    return memoryUpload.single(field);
  }

  if (mode === "multiple" && typeof field === "string") {
    return memoryUpload.array(field, maxCount);
  }

  if (mode === "fields" && Array.isArray(field)) {
    return memoryUpload.fields(field);
  }

  // Return a middleware that throws an error
  return (req, res, next) => {
    next(createHttpError(400, "Invalid parameters passed to commonUploader"));
  };
};

export const commonUploader1 = (
  mode: "single" | "multiple" | "fields",
  field: string | { name: string; maxCount: number }[],
  maxCount = 15,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (mode === "single" && typeof field === "string") {
      return memoryUpload.single(field);
    }

    if (mode === "multiple" && typeof field === "string") {
      return memoryUpload.array(field, maxCount);
    }

    if (mode === "fields" && Array.isArray(field)) {
      return memoryUpload.fields(field);
    }

    return next(createHttpError(400, "Invalid parameters passed to commonUploader"));
  };
};

interface AnyUploadRequest extends Request {
  file?: Express.Multer.File;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}

export const validateAllFiles = (req: AnyUploadRequest, res: Response, next: NextFunction) => {
  const files: Express.Multer.File[] = [];

  if (req.file) {
    files.push(req.file);
  } else if (Array.isArray(req.files)) {
    files.push(...req.files);
  } else if (req.files && typeof req.files === "object") {
    Object.values(req.files).forEach((arr) => files.push(...arr));
  }

  for (const file of files) {
    const limit = MAX_FILE_SIZE_LIMITS[file.mimetype];

    if (!limit) {
      return next(createHttpError(400, `Unsupported file type: ${file.mimetype}`));
    }

    if (file.size > limit) {
      return next(
        createHttpError(
          400,
          `File "${file.originalname}" exceeds the size limit (${limit / (1024 * 1024)}MB)`,
        ),
      );
    }
  }

  next();
};
