import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";

export const AuthController = {
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      if ((req as any).user.role !== "admin") {
        return res.status(403).json({ message: "Only admin can create users" });
      }
      const user = await AuthService.createUser(req.body);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { credentials, password } = req.body;
      const user = await AuthService.loginWithCredentials(
        credentials,
        password,
      );
      const tokens = AuthService.generateTokens(user);
      res.json({ user, ...tokens });
    } catch (err) {
      next(err);
    }
  },

  async requestOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const otp = await AuthService.generateOtpByEmail(email);
      res.json({ message: "OTP sent successfully to your email", otp });
    } catch (err) {
      next(err);
    }
  },

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      const user = await AuthService.verifyOtpByEmail(email, otp);
      const tokens = AuthService.generateTokens(user);
      res.json({ user, ...tokens });
    } catch (err) {
      next(err);
    }
  },

  async requestAdminOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { credentials } = req.body;
      if (!credentials) {
        return res.status(400).json({ message: "Credentials are required" });
      }
      const result = await AuthService.generateAdminOtp(credentials);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async verifyAdminOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { credentials, otp } = req.body;
      if (!credentials || !otp) {
        return res
          .status(400)
          .json({ message: "Credentials and OTP are required" });
      }
      const user = await AuthService.verifyAdminOtp(credentials, otp);
      const tokens = AuthService.generateTokens(user);
      res.json({ user, ...tokens });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token required" });
      }
      const tokens = await AuthService.refreshAccessToken(refreshToken);
      res.json(tokens);
    } catch (err) {
      console.error("Token refresh error:", err);
      res.status(401).json({ message: "Invalid or expired refresh token" });
    }
  },

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      const userData = await AuthService.getUserWithFollowUps(user.id);
      res.json(userData);
    } catch (err) {
      next(err);
    }
  },

  async getUserCredentialsById(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Only admin can access user credentials" });
      }

      const credentials = await AuthService.getUserCredentialsById(
        req.params.id,
      );
      res.json(credentials);
    } catch (err) {
      next(err);
    }
  },

  async updateUserPasswordById(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Only admin can update user password" });
      }

      const { password } = req.body;

      const result = await AuthService.updateUserPasswordById(
        req.params.id,
        password,
      );

      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
