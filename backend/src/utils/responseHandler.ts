import { Response } from "express";
 export const response = (
  res: Response,
  statusCode: number,
  message: string,
  data: any = null
) => {
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
