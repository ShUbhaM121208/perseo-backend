import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
            };
        }
    }
}
export declare const requireSupabaseAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserIdFromReq: (req: Request) => string | undefined;
export declare const getUserEmailFromReq: (req: Request) => string | undefined;
