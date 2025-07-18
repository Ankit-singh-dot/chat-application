"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpGenerator = void 0;
const otpGenerator = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
};
exports.otpGenerator = otpGenerator;
