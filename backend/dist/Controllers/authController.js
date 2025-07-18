"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtpHandler = exports.sendOtp = void 0;
const otpGenerator_1 = require("../utils/otpGenerator");
const client_1 = require("@prisma/client");
const responseHandler_1 = require("../utils/responseHandler");
const emailServices_1 = require("../Services/emailServices");
const twilioServices_1 = require("../Services/twilioServices");
const twilioServices_2 = require("../Services/twilioServices");
const generateToken_1 = require("../utils/generateToken");
const prisma = new client_1.PrismaClient();
const sendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNumber, phoneSuffix, email } = req.body;
    const otp = (0, otpGenerator_1.otpGenerator)();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);
    let user;
    try {
        if (email) {
            user = yield prisma.user.findUnique({
                where: { email: email },
            });
            if (!user) {
                user = yield prisma.user.create({ data: { email: email } });
            }
            user.emailOtp = otp;
            user.emailOtpExpiry = expiry;
            yield yield prisma.user.update({
                where: { id: user.id },
                data: {
                    emailOtp: otp,
                    emailOtpExpiry: expiry,
                },
            });
            yield (0, emailServices_1.sendOtpToEmail)(email, otp);
            return (0, responseHandler_1.response)(res, 200, "OTP sent to email", { email });
        }
        if (!phoneNumber || !phoneSuffix) {
            return (0, responseHandler_1.response)(res, 400, "Phone number and suffix are required");
        }
        const fullPhoneNumber = `${phoneNumber}${phoneSuffix}`;
        user = yield prisma.user.findUnique({
            where: { phoneNumber: phoneNumber, phoneSuffix: phoneSuffix },
        });
        if (!user) {
            user = yield prisma.user.create({
                data: { phoneNumber: phoneNumber, phoneSuffix: phoneSuffix },
            });
        }
        yield (0, twilioServices_1.sendOtpToPhone)(fullPhoneNumber);
        return (0, responseHandler_1.response)(res, 200, "OTP sent to phone", { phoneNumber });
    }
    catch (error) {
        console.error("Error sending OTP:", error);
        return (0, responseHandler_1.response)(res, 500, "Internal server error");
    }
});
exports.sendOtp = sendOtp;
const verifyOtpHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNumber, phoneSuffix, email, otp } = req.body;
    try {
        if (email) {
            const user = yield prisma.user.findUnique({
                where: { email: email },
            });
            if (!user || user.emailOtp !== otp || !user.emailOtpExpiry || user.emailOtpExpiry < new Date()) {
                return (0, responseHandler_1.response)(res, 400, "Invalid or expired OTP");
            }
            yield prisma.user.update({
                where: { id: user.id },
                data: {
                    emailOtp: null,
                    emailOtpExpiry: null,
                },
            });
            return (0, responseHandler_1.response)(res, 200, "Email OTP verified successfully");
        }
        if (!phoneNumber || !phoneSuffix || !otp) {
            return (0, responseHandler_1.response)(res, 400, "Phone number, suffix, and OTP are required");
        }
        const fullPhoneNumber = `${phoneNumber}${phoneSuffix}`;
        const user = yield prisma.user.findUnique({
            where: { phoneNumber: phoneNumber, phoneSuffix: phoneSuffix },
        });
        if (!user) {
            return (0, responseHandler_1.response)(res, 404, "user not found");
        }
        const result = yield (0, twilioServices_2.verifyOtp)(fullPhoneNumber, otp);
        if (result.status !== "approved") {
            return (0, responseHandler_1.response)(res, 400, "Invalid otp");
        }
        user.isVerified = true;
        yield prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
            },
        });
        const token = (0, generateToken_1.generateToken)(user === null || user === void 0 ? void 0 : user.id);
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365,
        });
        return (0, responseHandler_1.response)(res, 200, "Phone OTP verified successfully", {
            token,
            user,
        });
    }
    catch (error) {
        console.log("Error verifying OTP:", error);
        return (0, responseHandler_1.response)(res, 500, "Internal server error");
    }
});
exports.verifyOtpHandler = verifyOtpHandler;
