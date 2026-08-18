import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [credentials, setCredentials] = useState({
    credential: "",
    password: "",
    mobile: "",
    email: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const router = useRouter();
  const { signIn, sendOtp, verifyOtp, isLoading, error } = useAuth();

  const handleLogin = async (type: "credentials" | "otp") => {
    if (type === "credentials") {
      try {
        const response = await signIn(
          credentials.credential,
          credentials.password,
        );
        if (response.success) {
          toast({
            title: "Welcome back!",
            description: "You've successfully logged in.",
          });
          router.push("/dashboard");
        } else {
          toast({
            title: "Login failed",
            description: error || "Please check your email and password.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Login Error:", error);
        toast({
          title: "Login Error",
          description: error?.message || "Failed to login. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      await handleSendOtp();
    }
  };

  const handleSendOtp = async () => {
    if (!credentials.email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    const result = await sendOtp(credentials.email);
    
    if (result.success) {
      setOtpSent(true);
      setOtpValue(""); // Clear any previous OTP
      toast({
        title: "OTP Sent Successfully",
        description: "Please check your email for the 6-digit OTP code",
      });
    } else {
      toast({
        title: "Failed to Send OTP",
        description: result.message || "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpValue || otpValue.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    const result = await verifyOtp(credentials.email, otpValue);

    if (result.success) {
      toast({
        title: "Login Successful!",
        description: "Welcome back to O Positive Health CRM",
      });
      router.push("/dashboard");
    } else {
      toast({
        title: "Verification Failed",
        description: error || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
      // Clear the OTP input on error
      setOtpValue("");
    }
  };

  const handleResendOtp = async () => {
    setOtpValue(""); // Clear current OTP
    await handleSendOtp();
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 min-h-[600px]">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <div className="flex flex-col items-center text-center mb-8">
              <Image
                src="/images/logo.png"
                alt="Logo"
                className="h-auto w-24 mb-6"
                width={512}
                height={512}
              />
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <p className="text-muted-foreground text-balance">
                Login to your O Positive Account
              </p>
            </div>

            <Tabs defaultValue="credentials" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="credentials">Login</TabsTrigger>
                <TabsTrigger value="otp">Login with OTP</TabsTrigger>
              </TabsList>

              <TabsContent value="credentials" className="mt-6">
                <form className="space-y-4">
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="userId">User ID / Employee ID</Label>
                      <Input
                        id="userId"
                        type="text"
                        value={credentials.credential}
                        onChange={(e) =>
                          setCredentials({
                            ...credentials,
                            credential: e.target.value,
                          })
                        }
                        placeholder="Enter your User ID/Email/Employee ID"
                      />
                    </div>
                    <div className="grid gap-3">
                      <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        {/* <Link
                        href="/forgot-password"
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </Link> */}
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={credentials.password}
                          onChange={(e) =>
                            setCredentials({
                              ...credentials,
                              password: e.target.value,
                            })
                          }
                          placeholder="Enter your password"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label="Toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </Button>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                        {error}
                      </div>
                    )}

                    <Button
                      onClick={() => handleLogin("credentials")}
                      disabled={
                        isLoading ||
                        !credentials.credential ||
                        !credentials.password
                      }
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </div>
                  <div className="text-center text-sm mt-2">
                    Need help?{" "}
                    <Link
                      href="mailto:support@opositivehealth.com"
                      className="underline underline-offset-4"
                    >
                      Contact Support
                    </Link>
                  </div>
                </form>
              </TabsContent>
              <TabsContent value="otp" className="mt-6">
                {!otpSent ? (
                  <div>
                    <div className="space-y-2 py-12">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={credentials.email}
                        onChange={(e) =>
                          setCredentials({
                            ...credentials,
                            email: e.target.value,
                          })
                        }
                        placeholder="Enter your email address"
                        disabled={isLoading}
                      />
                    </div>

                    <Button
                      onClick={() => handleLogin("otp")}
                      className="w-full mt-4"
                      disabled={isLoading || !credentials.email}
                    >
                      {isLoading ? "Sending OTP..." : "Send OTP"}
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="space-y-2 py-6">
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-semibold">Verify OTP</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          Enter the 6-digit code sent to {credentials.email}
                        </p>
                      </div>
                      <Label htmlFor="otp">Enter OTP</Label>
                      <Input
                        id="otp"
                        type="text"
                        maxLength={6}
                        value={otpValue}
                        onChange={(e) =>
                          setOtpValue(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="Enter 6-digit OTP"
                        className="text-center text-2xl tracking-widest"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Button
                        onClick={handleVerifyOtp}
                        className="w-full"
                        disabled={isLoading || otpValue.length !== 6}
                      >
                        {isLoading ? "Verifying..." : "Verify OTP"}
                      </Button>
                      <Button
                        onClick={handleResendOtp}
                        variant="outline"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Resending..." : "Resend OTP"}
                      </Button>
                    </div>
                  </div>
                )}
                <div className="text-center text-sm mt-2">
                  Need help?{" "}
                  <Link
                    href="mailto:info@opositivehealth.com"
                    className="underline underline-offset-4"
                  >
                    Contact Support
                  </Link>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/images/login-bg.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our{" "}
        <Link
          href="https://opositivehealth.com/terms"
          target="_blank"
          className="ml-1 underline"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="https://opositivehealth.com/privacy"
          target="_blank"
          className="underline"
        >
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
}
