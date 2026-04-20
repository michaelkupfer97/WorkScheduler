import { Request, Response, NextFunction } from 'express';

interface SchemaLike {
  parse(data: unknown): unknown;
}

export function validate(schema: SchemaLike) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error?.errors && Array.isArray(error.errors)) {
        const errors: Record<string, string[]> = {};
        error.errors.forEach((e: any) => {
          const field = e.path?.join('.') || 'unknown';
          if (!errors[field]) errors[field] = [];
          errors[field].push(e.message);
        });
        res.status(400).json({ message: 'Validation failed', errors });
        return;
      }
      next(error);
    }
  };
}
