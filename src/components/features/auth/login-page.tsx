import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/toast";
import { loginSchema, LoginFormData } from "@/utils/validation";
import { useRouter } from "next/navigation";

interface LoginPageProps {
  onGoogleLogin?: () => void;
  onAppleLogin?: () => void;
}

export default function LoginPage({
  onGoogleLogin,
  onAppleLogin,
}: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();
  const { toasts, removeToast, error: showError, success } = useToast();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    try {
      await login(data.email, data.password);
      success("Login successful. Please verify your OTP.");
    } catch (err) {
      showError(error || "Login failed");
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="flex items-center justify-center w-full ">
        <div className="w-full max-w-[640px]">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8 lg:space-y-12 "
          >
            <div className="space-y-2">
              <h2 className="text-gray-900 text-[1.75rem] md:text-[2rem] tracking-[-2%] lg:text-[2.5rem] font-bold  leading-[100%] ">
                Welcome back!
              </h2>
              <p className="text-gray-600 text-xs md:text-base font-medium leading-[100%]">
                Securely access your account and manage payroll with ease
              </p>
            </div>

            <div className="space-y-6 ">
              <div>
                <label
                  htmlFor="email"
                  className="block text-gray-900 text-xs font-medium mb-2"
                >
                  Email address <span className="text-red-500">*</span>
                </label>
                <div className="text-gray-900 ">
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="Provide email address "
                    className={`w-full pl-3 pr-3 py-3 sm:py-3.5 bg-gray-50 text-gray-900 rounded-[8px] border ${
                      errors.email ? "border-red-300" : "border-gray-200"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm sm:text-base`}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                </div>
                {errors.email && (
                  <p
                    id="email-error"
                    className="mt-2 text-sm text-red-600"
                    role="alert"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="text-gray-900">
                <label
                  htmlFor="password"
                  className="block text-gray-900 text-xs font-medium mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className={`w-full pr-12 pl-3 py-3 sm:py-3.5 bg-gray-50 text-gray-900 rounded-[8px] border ${
                      errors.password ? "border-red-300" : "border-gray-200"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E2A8C] focus:border-[#5E2A8C] transition-all duration-200 text-sm sm:text-base`}
                    placeholder="Enter password"
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p
                    id="password-error"
                    className="mt-2 text-sm text-red-600"
                    role="alert"
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <Link
                  href="/forgot-password"
                  className="text-[16px] text-[#5E2A8C] font-semibold hover:text-[#4E2275] focus:outline-none "
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <div className="space-y-8 ">
              <div className="space-y-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3.5 sm:py-4 text-[16px] px-4 rounded-xl font-semibold text-white text-sm sm:text-base transition-all duration-200 cursor-pointer ${
                    !isLoading
                      ? "bg-[#5E2A8C] hover:bg-[#4E2275] focus:outline-none focus:ring-2 focus:ring-[#5E2A8C] focus:ring-offset-2 transform  active:scale-[0.98]"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 mr-2 border-2 rounded-full border-white/30 border-t-white animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    "Continue"
                  )}
                </button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-600 text-[16px] font-medium">
                      OR
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 ">
                  <button
                    type="button"
                    className="w-full flex flex-row gap-2 justify-center  items-center py-2.5 sm:py-3 px-2 sm:px-4 border border-gray-200 rounded-lg shadow-sm bg-white text-xs sm:text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5E2A8C] transition-colors"
                  >
                    <span className="text-gray-900 text-[16px] font-medium">
                      Login with
                    </span>
                    <svg
                      className="shrink-0 w-5 h-5 mr-1 sm:mr-2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="w-full flex flex-row gap-2 justify-center items-center py-2.5 sm:py-3 px-2 sm:px-4 border border-gray-200 rounded-lg shadow-sm bg-white text-xs sm:text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5E2A8C] transition-colors"
                  >
                    <span className="text-gray-900 text-[16px] font-medium">
                      Login with
                    </span>
                    <svg
                      className="shrink-0 w-5 h-5 mr-1 sm:mr-2"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="text-center ">
                <p className="text-[16px] font-medium flex flex-row gap-2 justify-center items-center sm:text-sm text-gray-600">
                  New to VestRoll?
                  <Link
                    href="/register"
                    className="font-semibold text-[16px] text-[#5E2A8C] hover:text-[#4E2275] focus:outline-none "
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
