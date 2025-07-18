"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.response = void 0;
const response = (res, statusCode, message, data = null) => {
    if (!res) {
        console.log("Response object is not defined");
        return;
    }
    const responseObject = {
        status: statusCode < 400 ? "success" : "error",
        message: message,
        data: data,
    };
    return res.status(statusCode).json(responseObject);
};
exports.response = response;
