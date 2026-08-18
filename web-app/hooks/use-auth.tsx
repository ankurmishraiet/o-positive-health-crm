"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import axios from "@/axios/axios";
import { UserType } from "@/types/user";

type AuthSession = {
  user: UserType | null;
  token?: string;
};

interface AuthContextType {
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  socialerror: string | null;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; user?: UserType }>;
  signUp: (
    userData: Partial<UserType> & { password: string }
  ) => Promise<{ success: boolean; user?: UserType }>;
  sendOtp: (email: string) => Promise<{ success: boolean; message?: string }>;
  verifyOtp: (
    email: string,
    otp: string
  ) => Promise<{ success: boolean; user?: UserType }>;
  updateSession: (user: UserType | null) => void;
  signOut: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socialerror, setSocialerror] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("authToken");

        if (!storedUser || !token) {
          setIsLoading(false);
          return;
        }

        try {
          const res = await axios.get("/auth/me");
          const freshUser: UserType = res.data;
          localStorage.setItem("user", JSON.stringify(freshUser));
          setSession({ user: freshUser, token });
        } catch (err) {
          console.warn("Profile fetch failed, keeping stored user:", err);
          if ((err as any)?.response?.status === 401) {
            signOut();
          }
        }
      } catch (err) {
        console.error("Authentication error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: UserType }> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await axios.post("/auth/login", {
        credentials: email,
        password,
      });

      if (res.status !== 200 || !res.data.user || !res.data.access) {
        throw new Error("Invalid response from server");
      }

      const user: UserType = res.data.user;
      localStorage.setItem("authToken", res.data.access);
      if (res.data.refresh) {
        localStorage.setItem("refreshToken", res.data.refresh);
      }
      localStorage.setItem("user", JSON.stringify(user));
      setSession({ user });

      return { success: true, user };
    } catch (err) {
      setError(
        "Failed to sign in. Please check your credentials and try again."
      );
      console.error("Sign in error:", err);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const getProfile = async (user: UserType | null) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    if (!user || !user._id) {
      console.error("Invalid user data for profile fetch");
      return;
    }
    try {
      const res = await axios.get(`/auth/me`);

      if ((res.status === 200 || res.status === 304) && res.data) {
        const user: UserType = res.data;
        localStorage.setItem("user", JSON.stringify(user));
        setSession({ user, token });
      }
    } catch (err) {
      console.error("Failed to fetch latest profile:", err);
      signOut();
    }
  };

  const signUp = async (
    userData: Partial<UserType> & { password: string }
  ): Promise<{ success: boolean; user?: UserType }> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await axios.post("/users/auth/signup", {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
      });

      if (res.status !== 201 || !res.data.user || !res.data.access) {
        throw new Error("Invalid signup response");
      }

      const user: UserType = res.data.user;
      localStorage.setItem("authToken", res.data.access);
      localStorage.setItem("user", JSON.stringify(user));
      setSession({ user });

      return { success: true, user };
    } catch (err: any) {
      setError(`Failed to create account. ${err.response.data.message}`);
      console.error("Sign up error:", err);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("token");
    setSession(null);
    router.push("/");
  };

  const sendOtp = async (
    email: string
  ): Promise<{ success: boolean; message?: string }> => {
    if (!email) {
      setError("Email is required");
      return { success: false, message: "Email is required" };
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await axios.post("/auth/send-otp", { email });

      if (res.status === 200) {
        return { success: true, message: "OTP sent successfully" };
      }

      return { success: false, message: "Failed to send OTP" };
    } catch (err: any) {
      console.error("Send OTP error:", err);
      
      let errorMessage = "Failed to send OTP. Please try again.";
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (
    email: string,
    otp: string
  ): Promise<{ success: boolean; user?: UserType }> => {
    if (!email || !otp) {
      setError("Email and OTP are required");
      return { success: false };
    }

    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return { success: false };
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await axios.post("/auth/verify-otp", { email, otp });

      if (res.status === 200 && res.data.access && res.data.user) {
        const user: UserType = res.data.user;
        
        // Store both token formats for compatibility
        localStorage.setItem("authToken", res.data.access);
        localStorage.setItem("token", res.data.access);
        if (res.data.refresh) {
          localStorage.setItem("refreshToken", res.data.refresh);
        }
        localStorage.setItem("user", JSON.stringify(user));
        
        setSession({ user, token: res.data.access });

        return { success: true, user };
      }

      return { success: false };
    } catch (err: any) {
      console.error("Verify OTP error:", err);
      
      let errorMessage = "Invalid or expired OTP. Please try again.";
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
    setSocialerror(null);
  };

  const updateSession = (user: UserType | null) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      setSession({ user });
    } else {
      localStorage.removeItem("user");
      setSession(null);
    }
  };

  const value = {
    session,
    updateSession,
    isLoading,
    isAuthenticated: !!session?.user,
    error,
    socialerror,
    signIn,
    signUp,
    sendOtp,
    verifyOtp,
    signOut,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
