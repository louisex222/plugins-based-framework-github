import * as jwt from 'jsonwebtoken';

interface CustomJwtPayload {
    sub: string,
    account: string,
    role: string,
    tokenVersion: number,
}

const header = {
    alg:"HS256",
    typ:"JWT"   
}
const crypto = require('crypto');
const privateKey = crypto.randomBytes(64).toString('hex');

const options: jwt.SignOptions = {
    expiresIn: '7h',
    algorithm: 'HS256',
};
//產生token
export const generateJwtToken = (payload: CustomJwtPayload):string => {
    const token:string = jwt.sign(payload,privateKey,options);
    return token;
}

//驗證token
export const verifyJwtToken =(token:string):CustomJwtPayload | null => {
    try{
        const decoded = jwt.verify(token,privateKey,{
            algorithms: ['HS256'],
        }) as CustomJwtPayload & jwt.JwtPayload;
        const customPayload:CustomJwtPayload = {
            sub: decoded.sub,
            account: decoded.account,
            role: decoded.role,
            tokenVersion: decoded.tokenVersion,
        }
        return customPayload;
        
    }
    catch(error){
        if(error instanceof jwt.TokenExpiredError){
            console.error('token 過期')
        }else if (error instanceof jwt.JsonWebTokenError){
            console.error('token 無效或錯誤')
        }else{
            console.error('token 驗證失敗')
        }
        return null;
    }
}
