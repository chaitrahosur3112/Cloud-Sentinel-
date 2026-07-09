import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as authController from "../controllers/auth.controller";
import { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } from "../validators/auth.validator";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { success: false, error: { message: "Too many attempts, please try again later" } },
});

router.post("/register",        validateRegister,                    authController.register);
router.get("/verify-email",                                          authController.verifyEmail);
router.post("/login",           authLimiter, validateLogin,          authController.login);
router.post("/refresh",                                              authController.refresh);
router.post("/logout",                                               authController.logout);
router.post("/forgot-password", authLimiter, validateForgotPassword, authController.forgotPassword);
router.post("/reset-password",  validateResetPassword,               authController.resetPassword);
router.get("/me",               authenticate,                        authController.me);

export default router;