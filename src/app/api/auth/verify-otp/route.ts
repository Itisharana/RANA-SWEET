import { NextRequest, NextResponse } from "next/server";
import { getStoredOTP, markOTPVerified, deleteOTP } from "@/lib/otp-store";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const stored = getStoredOTP(email);

    if (!stored) {
      return NextResponse.json(
        { error: "OTP not found or expired. Please request a new code." },
        { status: 400 }
      );
    }

    if (Date.now() > stored.expires) {
      deleteOTP(email);
      return NextResponse.json(
        { error: "OTP has expired. Please request a new code." },
        { status: 400 }
      );
    }

    if (stored.otp !== otp) {
      return NextResponse.json(
        { error: "Invalid OTP. Please try again." },
        { status: 400 }
      );
    }

    markOTPVerified(email);

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}