import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/hooks/useAuth";
import { CheckCircle2, Loader } from "lucide-react";
import { useState } from "react";

export function ForgotPasswordDialog() {
  const [userEmail, setUserEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const forgotPassword = useForgotPassword();

  const handleForgetPass = async (email: string) => {
    try {
      await forgotPassword.mutateAsync({ email });
      setIsSuccess(true);

      // Close dialog after 2 seconds
      setTimeout(() => {
        setOpen(false);
        setIsSuccess(false);
        setUserEmail("");
      }, 2000);
    } catch (error) {
      console.error("Forgot password error:", error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset state when dialog closes
      setTimeout(() => {
        setIsSuccess(false);
        setUserEmail("");
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="h-5 w-fit p-0">
          Forgot Password?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {!isSuccess ? (
          // Email input form
          <>
            <DialogHeader>
              <DialogTitle>Forgot Password?</DialogTitle>
              <DialogDescription>
                Provide the email of the linked account.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Email
                </Label>
                <Input
                  id="link"
                  type="email"
                  placeholder="college@domain.edu.np"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  disabled={forgotPassword.isPending}
                />
              </div>
            </div>
            <DialogFooter className="sm:justify-start">
              <Button
                className="w-full"
                onClick={() => handleForgetPass(userEmail)}
                disabled={forgotPassword.isPending || !userEmail}
              >
                {forgotPassword.isPending ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          // Success message
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle2 className="mb-4 h-12 w-12 text-green-500" />
            <DialogHeader className="flex items-center">
              <DialogTitle className="text-green-600">Email Sent!</DialogTitle>
              <DialogDescription className="mt-2 text-base">
                We've sent a password reset link to:
                <br />
                <span className="text-foreground mt-1 block font-medium">
                  {userEmail}
                </span>
              </DialogDescription>
            </DialogHeader>
            <p className="text-muted-foreground mt-4 text-sm">
              Check your inbox and spam folder. The link will expire in 1 hour.
            </p>
            <p className="text-muted-foreground mt-6 text-xs">
              Closing automatically...
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
