import {Router,Request,Response} from 'express';
import {UserService} from '../services/UserService';
import multer from 'multer';
import { authMiddleware } from '../../../middleware/authMiddleware';
const upload = multer({
    storage:multer.memoryStorage(),
})
const router = Router();
const userService = new UserService();

//註冊
router.post('/register',async (req:Request,res:Response)=>{
    try {
        const {email,password,account,name,role} = req.body;
        const user = await userService.register(email,password,account,name,role);
        const status={
            status:200,
            data:user,
            message:"User registered successfully",
            code:"REGISTER_SUCCESS",
        }
        res.json(status);
    } catch (error) {
        res.json({
            status:500,
            message: "伺服器內部錯誤",
            code: "SERVER_INTERNAL_ERROR"
        });
    }
})

//登入
router.post('/login',async (req:Request,res:Response)=>{
    try {
        const {account,password} = req.body;
        const user = await userService.login(account,password);
        const status={
            status:200,
            data:user,
            message:"User logged in successfully",
            code:"LOGIN_SUCCESS",
        }
        res.json(status);
    } catch (error) {
        res.json({
            status:500,
            message: "伺服器內部錯誤",
            code: "SERVER_INTERNAL_ERROR"
        });
    }
})
//登出
router.post('/logout', async (req:Request,res:Response)=>{
    try {
        const {id} = req.body;
        const user = await userService.logout(id);
        const status={
            status:200,
            data:user,
            message:"User logged out successfully",
            code:"LOGOUT_SUCCESS",
        }
        res.json(status);
    } catch (error) {
        res.json({
            status:500,
            message: "伺服器內部錯誤",
            code: "SERVER_INTERNAL_ERROR"
        });
    }
})

//取得所有使用者
router.get('/allusers', authMiddleware, async (req:Request,res:Response)=>{
    try {
        const users = await userService.getAllUsers();
        const status = {
            status:200,
            data: users,
            message:"User updated successfully",
            code:"success",
        }
        res.json(status);
    } catch (error) {
        res.json({
            status:500,
            message: "伺服器內部錯誤",
            code: "SERVER_INTERNAL_ERROR"
        });
    }
})

//更新使用者
router.put('/updateuser', async (req:Request,res:Response)=>{
    try {
        const {id,name,email} = req.body;
        const user = await userService.updateUser(id,name,email);
        const status={
            status:200,
            data:user,
            message:"User updated successfully",
            code:"UPDATE_USER_SUCCESS",
        }
        res.json(status);
    } catch (error) {
        res.json({
            status:500,
            message: "伺服器內部錯誤",
            code: "SERVER_INTERNAL_ERROR"
        });
    }
})

//刪除使用者
router.delete('/deleteuser', async (req:Request,res:Response)=>{
    try {
        const {id ,email} = req.body;
        await userService.deleteUser(id,email);
        const status={
            status:200,
            message:"User deleted successfully",
            code:"DELETE_USER_SUCCESS",
        }
        res.json(status);
    } catch (error) {
        res.json({
            status:500,
            message: "伺服器內部錯誤",
            code: "SERVER_INTERNAL_ERROR"
        });
    }
})

//新增使用者
router.post('/adduser', (upload.single('avatarUrl') as any), async (req: Request, res: Response) => {
    try {
        const { name, email, state,role } = req.body;
        const file = req.file;
        const avatarBuffer = file ? file.buffer : null;
        
        const user = await userService.addUser(avatarBuffer, name, email, state,role);
        const status = {
            status: 200,
            data: user,
            message: "User added successfully",
            code: "ADD_USER_SUCCESS",
        }
        res.json(status);
    } catch (error:any) {
        const status={
            status:500,
            message: "伺服器內部錯誤",
            code: "SERVER_INTERNAL_ERROR",
        }
        res.json(status);
    }
})

//更新使用者狀態
router.put('/updatestate', async (req:Request,res:Response)=>{
    try {
        const {id,state} = req.body;
        const user = await userService.updateState(id,state);
        const status={
            status:200,
            data:user,
            message:"User state updated successfully",
            code:"UPDATE_USER_STATE_SUCCESS",
        }
        res.json(status);
    } catch (error) {
        res.json({
            status:500,
            message: "伺服器內部錯誤",
            code: "SERVER_INTERNAL_ERROR"
        });
    }
})

//取得線上使用者數量
router.get('/online-count', async (req: Request, res: Response) => {
    try {
        const count = await userService.getOnlineUserCount();
        const status={
            status:200,
            data:count,
            message:"Online user count retrieved successfully",
            code:"ONLINE_USER_COUNT_SUCCESS",
        }
        res.json(status);
    } catch (error) {
        res.json({
            status:500,
            message: "伺服器內部錯誤",
            code: "SERVER_INTERNAL_ERROR"
        });
    }
})

//更新使用者個人資料
router.put('/updateuserprofile', (upload.single('avatarUrl') as any), async (req:Request,res:Response)=>{
    try {
        const {id,name,email,account,password,state} = req.body;
        const file = req.file;
        const avatarBuffer = file ? file.buffer : null;
        const user = await userService.updateUserProfile(avatarBuffer,id,name,email,account,password,state);
        const status={
            status:200,
            data:user,
            message:"User profile updated successfully",
            code:"UPDATE_USER_PROFILE_SUCCESS",
        }
        res.json(status);
    } catch (error:any) {
        const status={
            status:500,
            message: "伺服器內部錯誤",
            code: "SERVER_INTERNAL_ERROR",
        }
        res.json(status);
    }
})

export default router;