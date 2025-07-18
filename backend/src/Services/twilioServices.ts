import twilio from "twilio";
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid: any = process.env.TWILIO_SERVICE_SID;
const client = twilio(accountSid, authToken);

export const sendOtpToPhone = async (phoneNumber: string) => {
  try {
    if (!phoneNumber) {
      throw new Error("Phone number is required");
    }
    const response = await client.verify.v2
      .services(serviceSid)
      .verifications.create({
        to: phoneNumber,
        channel: "sms",
      });
    console.log(`OTP sent to ${phoneNumber}: ${response.status}`);
    return response;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
};
export const verifyOtp = async (
  phoneNumber: string,
  otp: string
): Promise<boolean> => {
  try {
    if (!phoneNumber || !otp) {
      throw new Error("Phone number and OTP are required");
    }
    const response = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({
        to: phoneNumber,
        code: otp,
      });
    console.log(
      `OTP verification status for ${phoneNumber}: ${response.status}`
    );
    return response.status === "approved";
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw new Error("Failed to verify OTP");
  }
};


