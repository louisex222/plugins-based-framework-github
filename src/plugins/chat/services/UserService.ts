import prisma from "../../../lib/prisma";
import { User, Token } from "@prisma/client";
import { generateJwtToken } from '../../../scripts/token';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

interface CustomJwtPayload {
    sub: string,
    account: string,
    role: string,
    tokenVersion: number,
}

dayjs.extend(utc)
dayjs.extend(timezone)
export class UserService {
    //建立Token
    async createToken(userId: string, token: string): Promise<Token> {
            
            return await prisma.token.create({
                data: {
                    userId,
                    expiresAt: dayjs().tz('Asia/Taipei').add(7,'hour').format('YYYY-MM-DD HH:mm:ssZ'),
                    createdAt: dayjs().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ssZ'), 
                    token,
                }
            })
        }
    //註冊
    async register(email: string, password: string, account: string,name:string,role:string): Promise<User> {
        const exitUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (exitUser) {
            throw new Error("User already exists");
        }
        const user = await prisma.user.create({
            data: {
                id: uuidv4(),
                createdAt:dayjs().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ssZ'),
                name,
                email,
                isVerified: false,
                password,
                account,
                role,
                state: "offline",
            },
        });
        return user;
    }
    //登入
    async login(account: string, password: string): Promise<any> {
        const user = await prisma.user.findUnique({
            where: {
                account,
            },
            include: {
                tokens: true,
            },
        });
        
        if (!user) {
            throw new Error("User not found");
        }
        if (user.password !== password) {
            throw new Error("Invalid password");
        }
        const newToken = user.tokenVersion + 1;
        const userPayload: CustomJwtPayload ={
            sub: user.id,
            account: user.account,
            role: user.role,
            tokenVersion: newToken,
        }
        const accessToken:string = generateJwtToken(userPayload);
    
        const token = await prisma.token.findFirst({
            where: {
                userId: user.id,
            },
        })

        // 不論 Token 是否過期，只要有登入行為就刪除舊 Token 並核發新版
        if(token){
            await prisma.token.delete({
                where: {
                    id: token.id,
                },
            })
        }

        // 建立新 Token
        await this.createToken(user.id, accessToken);
        
        // 更新使用者狀態與版本號
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                isVerified: true,
                state: "online",
                tokenVersion: newToken,
            }
        })
        const mixData = await prisma.user.findUnique({
            where: {
                id: user.id,
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                isVerified: true,
                state: true,
                role:true,
                account:true,
                tokenVersion:true,
                password:true,
                tokens: {
                    select: {
                        token: true,
                        expiresAt: true,
                        createdAt: true,
                    }
                }
            },
        });
        
        if (mixData && mixData.avatarUrl) {
            (mixData as any).avatarUrl = `data:image/png;base64,${(mixData.avatarUrl as unknown as Buffer).toString('base64')}`;
        }

        return mixData;
       

    }
    async logout(userId:string): Promise<boolean>{
        try{
            await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    state: "offline",
                }
            })
            return true;
        }catch(error:any){
            throw error;
        }
    }
    //取得使用者全部資料
    async getAllUsers(): Promise<User[]>{
       const data = await prisma.user.findMany({
           orderBy: { createdAt: 'desc' }
       })
       return data.map(user => {
           if (user.avatarUrl) {
               return {
                   ...user,
                   avatarUrl: `data:image/png;base64,${(user.avatarUrl as unknown as Buffer).toString('base64')}`
               } as any as User;
           }
           return user;
       });
    }
    //修改使用者資料
    async updateUser(id:string,name:string,email:string):Promise<User>{
        try{
             // 先刪除該用戶的所有 Token
             await prisma.token.deleteMany({
                where: {
                    userId: id,
                },
            })

            const user = await prisma.user.update({
                where: {
                    id,
                },
                data:{
                    name,
                    email,
                    state: "offline",
                    tokenVersion: {
                        increment: 1
                    }
                }
            })
            return user;
        }catch(error:any){
            throw error;
        }
    }
    //刪除使用者
    async deleteUser(id:string,email:string):Promise<boolean>{
        try{
            //先刪除該用戶的所有 Token
            await prisma.token.deleteMany({
                where: {
                    userId: id,
                },
            })
            //再刪除該用戶
            await prisma.user.delete({
                where: {
                    email
                },
            })
            return true;
        }catch(error:any){
            if(error.code === 'P2025'){
                return false;
            }
            throw error;
        }
    }
    //新增使用者
    async addUser(avatarUrl: Buffer | null, name: string, email: string, state: string,role:string) {
        try{
            const user = await prisma.user.create({
                data: {
                    id: uuidv4(),
                    createdAt:dayjs().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ssZ'),
                    name,
                    avatarUrl: avatarUrl as any,
                    email,
                    isVerified: true,
                    password:"a123456",
                    account: name,
                    role,
                    state,
                },
            })
            return user;
        }catch(error:any){
            throw error;
        }
    }
    //更新使用者狀態
    async updateState(id:string,state:string):Promise<User>{
        try{
            if(!id){
                throw new Error("User not found");
            }
            const user = await prisma.user.update({
                where: {
                    id,
                },
                data:{
                    state,
                }
            })
            return user;
        }catch(error:any){
            throw error;
        }
    }
    //取得線上使用者數量
    async getOnlineUserCount():Promise<number>{
        try{
            const count = await prisma.user.count({
                where: {
                    state: "online"
                }
            })
            return count;
        }catch(error:any){
            throw error;
        }
    }
    //更新使用者個人資料
    async updateUserProfile( avatarUrl: Buffer | null,id:string,name:string,email:string,account:string,password:string,state:string):Promise<User>{
        try{
            if(!id){
                throw new Error("User not found");
            }
            const user = await prisma.user.update({
                where: {
                    id,
                },
                data:{
                    name,
                    createdAt:dayjs().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ssZ'),
                    email,
                    account,
                    password,
                    avatarUrl: avatarUrl ? (avatarUrl as any) : undefined,
                    state
                }
            })
            return user;
        }catch(error:any){
            throw error;
        }
    }
}