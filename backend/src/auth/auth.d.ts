import { Request } from "express";

export interface JwtPayload {
    sub: string;
    email: string;
}

export interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        email: string;
        refreshToken?: string;
    }
}
