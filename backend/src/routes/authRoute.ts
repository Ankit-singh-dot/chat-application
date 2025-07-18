import express from "express";
import { sendOtp } from "../Controllers/authController";
import { verifyOtpHandler } from "../Controllers/authController";
const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtpHandler);
export default router;
