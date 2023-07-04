import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * 
 * @param req - Request object
 * @param res - Response object
 * @param next - Next function
 * @returns - Validation errors
 */
const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

export default validateRequest;
