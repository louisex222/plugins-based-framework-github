import { Request, Response, NextFunction } from 'express';
import { verifyJwtToken } from '../scripts/token';
import prisma from '../lib/prisma';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 401,
                message: "未提供認證憑證",
                code: "UNAUTHORIZED"
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyJwtToken(token);

        if (!decoded) {
            return res.status(401).json({
                status: 401,
                message: "token 無效或過期",
                code: "INVALID_TOKEN"
            });
        }

        // 查詢資料庫中的最新版本號
        const user = await prisma.user.findUnique({
            where: { id: decoded.sub },
            select: { tokenVersion: true }
        });

        if (!user) {
            return res.status(401).json({
                status: 401,
                message: "帳號不存在",
                code: "ACCOUNT_NOT_FOUND"
            });
        }

        // 核心邏輯：後踢前
        // 如果 Token 中的版本號不等於資料庫中的版本號，代表該帳號已在其他地方登入
        if (decoded.tokenVersion !== user.tokenVersion) {
            return res.status(401).json({
                status: 401,
                message: "帳號已在其他地方登入",
                code: "ACCOUNT_LOOGED_IN_ELSEWHERE"
            });
        }

        // 將使用者資訊存入 req，方便後續使用
        (req as any).user = decoded;
        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        res.status(500).json({
            status: 500,
            message: "伺服器內部錯誤",
            code: "SERVER_INTERNAL_ERROR"
        });
    }
};
