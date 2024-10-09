import { Request, Response, NextFunction, RequestHandler } from 'express';
import { validationResult } from 'express-validator';

/**
 * Middleware to validate the request.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
const validateRequest: RequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
    } else {
        next(); // Call next() only when there are no errors.
    }
};

export default validateRequest;
