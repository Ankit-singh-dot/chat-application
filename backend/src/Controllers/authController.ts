import { Request, Response } from "express";
import { otpGenerator } from "../utils/otpGenerator";
import { PrismaClient } from "@prisma/client";
import { response } from "../utils/responseHandler";
import { sendOtpToEmail } from "../Services/emailServices";
import { sendOtpToPhone } from "../Services/twilioServices";
import { verifyOtp } from "../Services/twilioServices";
import { generateToken } from "../utils/generateToken";
const prisma = new PrismaClient();
export const sendOtp = async (req: Request, res: Response): Promise<any> => {
  const { phoneNumber, phoneSuffix, email } = req.body;
  const otp = otpGenerator();
  const expiry = new Date(Date.now() + 5 * 60 * 1000);
  let user;
  try {
    if (email) {
      user = await prisma.user.findUnique({
        where: { email: email },
      });
      if (!user) {
        user = await prisma.user.create({ data: { email: email } });
      }
      user.emailOtp = otp;
      user.emailOtpExpiry = expiry;
      await await prisma.user.update({
        where: { id: user.id },
        data: {
          emailOtp: otp,
          emailOtpExpiry: expiry,
        },
      });
      await sendOtpToEmail(email, otp);
      return response(res, 200, "OTP sent to email", { email });
    }
    if (!phoneNumber || !phoneSuffix) {
      return response(res, 400, "Phone number and suffix are required");
    }
    const fullPhoneNumber = `${phoneNumber}${phoneSuffix}`;
    user = await prisma.user.findUnique({
      where: { phoneNumber: phoneNumber, phoneSuffix: phoneSuffix },
    });
    if (!user) {
      user = await prisma.user.create({
        data: { phoneNumber: phoneNumber, phoneSuffix: phoneSuffix },
      });
    }
    await sendOtpToPhone(fullPhoneNumber);
    return response(res, 200, "OTP sent to phone", { phoneNumber });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return response(res, 500, "Internal server error");
  }
};
export const verifyOtpHandler = async (req: Request, res: Response): Promise<any> => {
  const { phoneNumber, phoneSuffix, email, otp } = req.body;
  try {
    if (email) {
      const user = await prisma.user.findUnique({
        where: { email: email },
      });
      if (!user || user.emailOtp !== otp || !user.emailOtpExpiry || user.emailOtpExpiry < new Date()) {
        return response(res, 400, "Invalid or expired OTP");
      }
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailOtp: null,
          emailOtpExpiry: null,
        },
      });
      return response(res, 200, "Email OTP verified successfully");
    }
    if (!phoneNumber || !phoneSuffix || !otp) {
      return response(res, 400, "Phone number, suffix, and OTP are required");
    }
    const fullPhoneNumber = `${phoneNumber}${phoneSuffix}`;
    const user = await prisma.user.findUnique({
      where: { phoneNumber: phoneNumber, phoneSuffix: phoneSuffix },
    });
    if (!user) {
      return response(res, 404, "user not found");
    }
    const result: any = await verifyOtp(fullPhoneNumber, otp);
    if (result.status !== "approved") {
      return response(res, 400, "Invalid otp");
    }
    user.isVerified = true;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
      },
    });
    const token = generateToken(user?.id);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
    return response(res, 200, "Phone OTP verified successfully", {
      token,
      user,
    });
  } catch (error) {
    console.log("Error verifying OTP:", error);
    return response(res, 500, "Internal server error");
  }
};
