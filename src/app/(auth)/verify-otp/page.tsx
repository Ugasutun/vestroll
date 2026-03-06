"use client";
import AuthLayer from "@/components/features/auth/AuthLayer";
import OTPVerification from "@/components/shared/otpVerificationModal";
import { useRouter } from "next/navigation";

function VerifyOTPPage() {
  const router = useRouter();
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const email = searchParams?.get("email") || "User";

  const handleVerify = async (otp: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const isValid = otp === "000000";

    if (isValid) {
      router.push("/dashboard");
    }

    return isValid;
  };

  const handleResend = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Verification code resent!");
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <OTPVerification
      email={email}
      onVerify={handleVerify}
      onResend={handleResend}
      onGoBack={handleGoBack}
      resendCooldown={60}
    />
  );
}

export default VerifyOTPPage;
