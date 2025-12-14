import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { storeOTP } from "@/lib/otp-store";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const otp = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000;

    storeOTP(email, otp, expires);

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Rana Sweets <onboarding@resend.dev>",
        to: email,
        subject: "Verify Your Email - Rana Sweets",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #FF9933 0%, #FF6B00 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 32px;">🍬 Rana Sweets</h1>
              <p style="color: white; margin: 5px 0 0 0; font-size: 16px;">Himachal Ka Swad</p>
            </div>
            <div style="background: white; padding: 40px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #8B4513; margin-top: 0;">Email Verification</h2>
              <p style="color: #666; font-size: 16px;">Thank you for registering with Rana Sweets! Please use the verification code below to complete your registration:</p>
              <div style="background: #FFF8DC; border: 2px solid #FF9933; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                <p style="margin: 0; color: #8B4513; font-size: 14px; font-weight: 600;">Your Verification Code</p>
                <p style="font-size: 36px; font-weight: bold; color: #FF6B00; margin: 10px 0; letter-spacing: 8px;">${otp}</p>
              </div>
              <p style="color: #666; font-size: 14px; margin-top: 30px;">This code will expire in <strong>10 minutes</strong>.</p>
              <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
              <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">© 2024 Rana Sweets. All rights reserved.</p>
            </div>
          </div>
        `,
      });
    }

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}