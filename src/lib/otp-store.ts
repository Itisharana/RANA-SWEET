const otpStore = new Map<string, { otp: string; expires: number; verified: boolean }>();

export function storeOTP(email: string, otp: string, expires: number) {
  otpStore.set(email, { otp, expires, verified: false });
}

export function getStoredOTP(email: string) {
  return otpStore.get(email);
}

export function markOTPVerified(email: string) {
  const stored = otpStore.get(email);
  if (stored) {
    otpStore.set(email, { ...stored, verified: true });
  }
}

export function isEmailVerified(email: string): boolean {
  const stored = otpStore.get(email);
  return stored?.verified === true;
}

export function deleteOTP(email: string) {
  otpStore.delete(email);
}
