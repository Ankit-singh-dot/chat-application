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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtp = exports.sendOtpToPhone = void 0;
const twilio_1 = __importDefault(require("twilio"));
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;
const client = (0, twilio_1.default)(accountSid, authToken);
const sendOtpToPhone = (phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!phoneNumber) {
            throw new Error("Phone number is required");
        }
        const response = yield client.verify.v2
            .services(serviceSid)
            .verifications.create({
            to: phoneNumber,
            channel: "sms",
        });
        console.log(`OTP sent to ${phoneNumber}: ${response.status}`);
        return response;
    }
    catch (error) {
        console.error("Error sending OTP:", error);
        throw new Error("Failed to send OTP");
    }
});
exports.sendOtpToPhone = sendOtpToPhone;
const verifyOtp = (phoneNumber, otp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!phoneNumber || !otp) {
            throw new Error("Phone number and OTP are required");
        }
        const response = yield client.verify.v2
            .services(serviceSid)
            .verificationChecks.create({
            to: phoneNumber,
            code: otp,
        });
        console.log(`OTP verification status for ${phoneNumber}: ${response.status}`);
        return response.status === "approved";
    }
    catch (error) {
        console.error("Error verifying OTP:", error);
        throw new Error("Failed to verify OTP");
    }
});
exports.verifyOtp = verifyOtp;
