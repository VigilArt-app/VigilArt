import { Request } from "express";

export type ClientType = "web" | "mobile";

export interface JwtPayload {
    sub: string;
    email: string;
    clientType?: ClientType;
}

export interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        email: string;
        refreshToken?: string;
        clientType?: ClientType;
    }
}
