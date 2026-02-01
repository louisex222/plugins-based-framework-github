import { Router, Request, Response } from 'express';
import { authMiddleware } from '../../../middleware/authMiddleware';
import os from 'os';
const router = Router();

router.get('/system-info',authMiddleware, (req: Request, res: Response) => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const useMemPercentage = (totalMem - freeMem) / totalMem * 100;
  const loadAverage = os.loadavg()[0];
  try{
    const status = {
        status:200,
        data:{
          memory: useMemPercentage.toFixed(1),
          cpu: loadAverage,
          uptime: os.uptime()
        },
        message: "Get System Info",
        code: "SYSTEM_INFO_SUCCESS"
    }
    return res.json(status);
  }catch(error){
    const status = {
      status:500,
      data:null,
      message: "伺服器內部錯誤",
      code: "SERVER_INTERNAL_ERROR"
    }
    return res.json(status);  
  }
})

export default router;
