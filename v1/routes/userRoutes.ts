import { Router, Request, Response, NextFunction } from "express";
import { signup, login, verifyOtp } from "../controllers/userController";

const router: Router = Router();

router.post(
  "/signup",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await signup(req, res);
    } catch (err) {
      next(err); 
    }
  }
);

router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await login(req, res);
    } catch (err) {
      next(err); 
    }
  }
);

router.post(
  "/verify_otp",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await verifyOtp(req, res);
    } catch (err) {
      next(err); 
    }
  }
);

export default router;
