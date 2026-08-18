"use client";

import { Card } from "@/components/ui/card";
import { useState } from "react";
import { PasswordResetForm } from "@/components/auth/password-reset";
import { OtpForm } from "@/components/auth/otp-form";
import { ForgotForm } from "@/components/auth/forgot-form";
import { toast } from "@/hooks/use-toast";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ForgotPassword() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [resetEmail, setResetEmail] = useState("");

  const handleNextStep = (index: number) => {
    setActiveIndex(index);
    if (index === 0) {
      setResetEmail("");
      toast({
        title: "Password reset successful. ",
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">
              Please login with your new password.
            </code>
          </pre>
        ),
      });
    }
  };

  return (
    <>
      <div className="container grid h-svh flex-col items-center justify-center bg-primary-foreground lg:max-w-none lg:px-0">
        <div className="mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[480px] lg:p-8">
          <Link
            href="/"
            className="mb-4 flex items-center justify-center hover:bg-gray-100 py-2 cursor-pointer"
          >
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <h1 className="ml-2 text-xl font-medium">O Positive Health</h1>
          </Link>

          {activeIndex === 0 ? (
            <Card className="p-6">
              <div className="mb-2 flex flex-col space-y-2 text-left">
                <h1 className="text-md font-semibold tracking-tight">
                  Forgot Password ?
                </h1>
                <p className="text-sm text-muted-foreground">
                  Please enter your registered email address/mobile number so we
                  can send you an OTP to reset your password.
                </p>
              </div>
              <ForgotForm
                onNext={(email) => {
                  handleNextStep(1);
                  setResetEmail(email);
                }}
              />
              <p className="mt-4 px-8 text-center text-sm text-muted-foreground">
                Need Help?{" "}
                <Link
                  href="mailto:support@opositivehealth.com"
                  className="underline underline-offset-4 hover:text-primary"
                  target="_blank"
                >
                  Contact Us
                </Link>
                .
              </p>
            </Card>
          ) : activeIndex === 1 ? (
            <Card className="p-6">
              <div className="mb-2 flex flex-col space-y-2 text-left">
                <h1 className="text-md font-semibold tracking-tight">
                  Two-factor Authentication
                </h1>
                <p className="text-sm text-muted-foreground">
                  Please enter the authentication code. We have sent the
                  authentication code to <b>{resetEmail}</b>.
                </p>
              </div>
              <OtpForm onNext={() => handleNextStep(2)} email={resetEmail} />
              <p className="mt-4 px-8 text-center text-sm text-muted-foreground">
                Haven&apos;t received it?{" "}
                <Button
                  onClick={() => {
                    toast({
                      title: "Resend OTP",
                      description: "A new OTP has been sent to your email.",
                    });
                  }}
                  variant="link"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Resend a new code.
                </Button>
                .
              </p>
            </Card>
          ) : (
            <Card className="p-6">
              <div className="mb-2 flex flex-col space-y-2 text-left">
                <h1 className="text-md font-semibold tracking-tight">
                  Reset Account Password
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter your new password. <br /> Make sure it&apos;s at least 8
                  characters long and includes a number.
                </p>
              </div>
              <PasswordResetForm
                onComplete={() => handleNextStep(0)}
                email={resetEmail}
              />
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
