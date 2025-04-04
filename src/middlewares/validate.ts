import { Request, Response, NextFunction, RequestHandler } from "express";
import { ObjectSchema } from "joi";
import createHttpError from "http-errors";

export const validate = (schema: ObjectSchema): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      return next(
        createHttpError(400, "Validation Error", {
          details: error.details.map((err) => err.message),
        }),
      );
    }

    next();
  };
};
