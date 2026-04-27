// pages/VerifyEmailPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useVerifyEmail } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, MailCheck, Home } from "lucide-react";

export function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [verificationState, setVerificationState] = useState<
    "verifying" | "success" | "error"
  >("verifying");
  const [countdown, setCountdown] = useState(3);

  const verifyEmail = useVerifyEmail(token!);

  useEffect(() => {
    const verifyUserEmail = async () => {
      try {
        await verifyEmail.mutateAsync();
        setVerificationState("success");
      } catch (error) {
        setVerificationState("error");
      }
    };

    if (token) {
      verifyUserEmail();
    } else {
      setVerificationState("error");
    }
  }, [token]);

  // Countdown for auto-redirect
  useEffect(() => {
    if (verificationState === "success" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (verificationState === "success" && countdown === 0) {
      navigate("/");
    }
  }, [verificationState, countdown, navigate]);

  const handleRedirect = () => {
    navigate("/");
  };

  const handleResendVerification = () => {
    navigate("/verify-email-prompt");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md transition-all duration-300 ease-in-out">
        {/* Verifying State */}
        {verificationState === "verifying" && (
          <Card className="animate-in fade-in zoom-in border-0 shadow-2xl duration-300">
            <CardHeader className="pb-2 text-center">
              <div className="mb-4 flex justify-center">
                <div className="relative">
                  <Loader2 className="text-primary h-16 w-16 animate-spin" />
                  <MailCheck className="text-primary absolute inset-0 m-auto h-8 w-8 animate-pulse" />
                </div>
              </div>
              <CardTitle className="animate-in slide-in-from-bottom-2 fill-mode-forwards text-2xl opacity-0 delay-100 duration-300">
                Verifying Your Email
              </CardTitle>
              <CardDescription className="animate-in slide-in-from-bottom-2 fill-mode-forwards mt-2 text-base opacity-0 delay-200 duration-300">
                Please wait while we verify your email address...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="h-1 w-full max-w-xs overflow-hidden rounded-full bg-gray-200">
                    <div className="bg-primary h-full animate-[progress_2s_ease-in-out_infinite]" />
                  </div>
                </div>
                <p className="text-muted-foreground animate-pulse text-center text-sm">
                  This will only take a moment...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success State */}
        {verificationState === "success" && (
          <Card className="animate-in fade-in zoom-in border-0 shadow-2xl duration-300">
            <CardHeader className="pb-2 text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                  <CheckCircle2 className="animate-in zoom-in h-16 w-16 text-green-600 duration-500 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="animate-in slide-in-from-bottom-2 fill-mode-forwards text-2xl text-green-600 opacity-0 delay-100 duration-300 dark:text-green-400">
                Email Verified!
              </CardTitle>
              <CardDescription className="animate-in slide-in-from-bottom-2 fill-mode-forwards mt-2 text-base opacity-0 delay-200 duration-300">
                Your email has been successfully verified.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="animate-in fade-in fill-mode-forwards rounded-lg bg-green-50 p-4 text-center opacity-0 delay-300 duration-500 dark:bg-green-900/20">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    You can now access all features of your account.
                  </p>
                </div>

                <div className="space-y-2 text-center">
                  <p className="text-muted-foreground text-sm">
                    Redirecting to home page in{" "}
                    <span className="text-foreground animate-pulse font-medium">
                      {countdown} second{countdown !== 1 ? "s" : ""}
                    </span>
                    ...
                  </p>

                  <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-green-500 transition-all duration-1000 ease-linear"
                      style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleRedirect}
                  className="animate-in fade-in fill-mode-forwards w-full gap-2 opacity-0 delay-500 duration-500"
                  size="lg"
                >
                  <Home className="h-4 w-4" />
                  Go to Home Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {verificationState === "error" && (
          <Card className="animate-in fade-in zoom-in border-0 shadow-2xl duration-300">
            <CardHeader className="pb-2 text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                  <XCircle className="animate-in zoom-in h-16 w-16 text-red-600 duration-500 dark:text-red-400" />
                </div>
              </div>
              <CardTitle className="animate-in slide-in-from-bottom-2 fill-mode-forwards text-2xl text-red-600 opacity-0 delay-100 duration-300 dark:text-red-400">
                Verification Failed
              </CardTitle>
              <CardDescription className="animate-in slide-in-from-bottom-2 fill-mode-forwards mt-2 text-base opacity-0 delay-200 duration-300">
                {verifyEmail.error
                  ? (verifyEmail.error as any)?.message ||
                    "The verification link is invalid or has expired."
                  : "Invalid verification link."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="animate-in fade-in fill-mode-forwards rounded-lg bg-red-50 p-4 text-center opacity-0 delay-300 duration-500 dark:bg-red-900/20">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Please request a new verification link or contact support.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleResendVerification}
                    variant="outline"
                    className="animate-in fade-in fill-mode-forwards w-full gap-2 opacity-0 delay-400 duration-500"
                  >
                    <MailCheck className="h-4 w-4" />
                    Resend Verification Email
                  </Button>
                  <Button
                    onClick={handleRedirect}
                    variant="ghost"
                    className="animate-in fade-in fill-mode-forwards w-full gap-2 opacity-0 delay-500 duration-500"
                  >
                    <Home className="h-4 w-4" />
                    Go to Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add custom keyframe animation to your global CSS or tailwind.config.js */}
      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
