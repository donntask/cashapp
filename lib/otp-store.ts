// In-memory OTP storage
// In production, consider using a database or Redis for persistence

interface OTPData {
  email: string;
  otp: string;
  timestamp: number;
  expiresAt: number;
}

class OTPStore {
  private store: Map<string, OTPData> = new Map();

  setOTP(email: string, otp: string, expiresIn: number = 10 * 60 * 1000) {
    const otpData: OTPData = {
      email,
      otp,
      timestamp: Date.now(),
      expiresAt: Date.now() + expiresIn,
    };
    this.store.set(email, otpData);
    console.log('[v0] OTP stored for:', email);
  }

  getOTP(email: string): OTPData | null {
    const otpData = this.store.get(email);
    if (!otpData) {
      return null;
    }

    // Check if expired
    if (Date.now() > otpData.expiresAt) {
      this.deleteOTP(email);
      return null;
    }

    return otpData;
  }

  deleteOTP(email: string) {
    this.store.delete(email);
  }

  verifyOTP(email: string, otp: string): boolean {
    const otpData = this.getOTP(email);
    if (!otpData) {
      return false;
    }

    const isValid = otpData.otp === otp;
    if (isValid) {
      this.deleteOTP(email);
    }
    return isValid;
  }

  getAllOTPs() {
    return Array.from(this.store.entries()).map(([email, data]) => ({
      email,
      otp: data.otp,
      expiresAt: new Date(data.expiresAt).toISOString(),
      expired: Date.now() > data.expiresAt,
    }));
  }
}

// Create a singleton instance
export const otpStore = new OTPStore();
