import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model";
import { EmailService } from "./communication/email.service";
import { Employee } from "../models/employee.model";
import { Lead } from "../models/lead.model";

export const AuthService = {
  async createUser(data: any) {
    const existing = await User.findOne({ phone: data.phone });
    if (existing) {
      throw new Error("User with this phone number already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = new User({
      ...data,
      password: hashedPassword,
    });

    await user.save();
    return user;
  },

  async loginWithCredentials(credentials: string, password: string) {
    const user = await User.findOne({
      $or: [
        { phone: credentials }, // phone is usually digits → case doesn't matter
        { email: { $regex: `^${credentials}$`, $options: "i" } },
        { employeeId: { $regex: `^${credentials}$`, $options: "i" } },
        { userId: { $regex: `^${credentials}$`, $options: "i" } },
      ],
    }).populate("customRole");

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Admin users can only login via OTP
    if (user.role === "admin") {
      throw new Error(
        "Admin users must login using OTP. Please use the 'Request OTP' option.",
      );
    }

    if (!user.password || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid credentials");
    }

    return user;
  },

  async generateOtp(phone: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60000); // 10 mins
    await User.findOneAndUpdate({ phone }, { otp, otpExpiresAt: expiry });
    return otp;
  },

  async generateOtpByEmail(email: string) {
    // Find user by email
    const user = await User.findOne({
      email: { $regex: `^${email}$`, $options: "i" },
    });

    if (!user) {
      throw new Error("User not found with this email");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60000); // 10 mins

    user.otp = otp;
    user.otpExpiresAt = expiry;
    await user.save();

    try {
      await EmailService.sendOtpEmail(user.email, otp, user.name || "User");
    } catch (error) {
      console.error("Failed to send OTP email:", error);
      throw new Error("Failed to send OTP email. Please try again later.");
    }

    return { email: user.email, message: "OTP sent to your email" };
  },

  async verifyOtpByEmail(email: string, otp: string) {
    const user = await User.findOne({
      email: { $regex: `^${email}$`, $options: "i" },
      otp,
    }).populate("customRole");

    if (!user || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new Error("Invalid or expired OTP");
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();
    return user;
  },

  async generateAdminOtp(credentials: string) {
    // Find admin user by email, phone, or userId
    const user = await User.findOne({
      $and: [
        { role: "admin" },
        {
          $or: [
            { phone: credentials },
            { email: { $regex: `^${credentials}$`, $options: "i" } },
            { employeeId: { $regex: `^${credentials}$`, $options: "i" } },
            { userId: { $regex: `^${credentials}$`, $options: "i" } },
          ],
        },
      ],
    });

    if (!user) {
      throw new Error("Admin user not found");
    }

    if (!user.email) {
      throw new Error("Admin user must have an email address configured");
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60000); // 10 mins

    // Update user with OTP
    user.otp = otp;
    user.otpExpiresAt = expiry;
    await user.save();

    // Send OTP via email
    try {
      await EmailService.sendOtpEmail(user.email, otp, user.name || "Admin");
    } catch (error) {
      console.error("Failed to send OTP email:", error);
      throw new Error("Failed to send OTP email. Please try again later.");
    }

    return { email: user.email, message: "OTP sent to your email" };
  },

  async verifyOtp(phone: string, otp: string) {
    const user = await User.findOne({ phone, otp });
    if (!user || user.otpExpiresAt! < new Date()) {
      throw new Error("Invalid or expired OTP");
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();
    return user;
  },

  async verifyAdminOtp(credentials: string, otp: string) {
    // Find admin user with matching OTP
    const user = await User.findOne({
      $and: [
        { role: "admin" },
        { otp },
        {
          $or: [
            { phone: credentials },
            { email: { $regex: `^${credentials}$`, $options: "i" } },
            { employeeId: { $regex: `^${credentials}$`, $options: "i" } },
            { userId: { $regex: `^${credentials}$`, $options: "i" } },
          ],
        },
      ],
    }).populate("customRole");

    if (!user || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new Error("Invalid or expired OTP");
    }

    // Clear OTP
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    user.isVerified = true;
    await user.save();

    return user;
  },

  async getUserById(id: string) {
    const user = await User.findById(id).populate("customRole");
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  },

  async getUserCredentialsById(id: string) {
    const user = await User.findById(id).select("email userId password").lean();

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },

  async updateUserPasswordById(id: string, password: string) {
    if (!password || !password.trim()) {
      throw new Error("Password is required");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    const user = await User.findById(id);
    if (!user) {
      throw new Error("User not found");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    return {
      message: "Password updated successfully",
      userId: user._id,
    };
  },

  async getUserWithFollowUps(id: string) {
    const user = await User.findById(id).populate("customRole");
    if (!user) {
      throw new Error("User not found");
    }

    // Get today's follow-ups for this user
    // Find the employee associated with this user
    const employee = await Employee.findOne({ userId: id });

    let followUpsToday: any[] = [];
    if (employee) {
      // Get start and end of today
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      // Find leads with follow-ups today assigned to this employee
      followUpsToday = await Lead.find({
        assignedTo: employee._id,
        "engagement.followUpAt": {
          $gte: startOfToday,
          $lte: endOfToday,
        },
      })
        .select(
          "patientName contact.mobile treatment engagement.followUpAt leadStatus",
        )
        .lean();
    }

    return {
      ...user.toObject(),
      followUpsToday,
      followUpsCount: followUpsToday.length,
    };
  },

  generateTokens(user) {
    const payload = {
      id: user._id,
      role: user.role,
      customRole: user.customRole?._id,
    };
    const access = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "2h",
    });
    const refresh = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      },
    );
    return { access, refresh };
  },

  async refreshAccessToken(refreshToken: string) {
    let decoded: any;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!,
      );
    } catch (err: any) {
      throw new Error("Invalid or expired refresh token");
    }

    const user = await User.findById(decoded.id).populate("customRole");
    if (!user) {
      throw new Error("User not found");
    }

    const access = jwt.sign(
      {
        id: user._id,
        role: user.role,
        customRole: (user.customRole as any)?._id,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "2h" },
    );
    return { access };
  },

  async deleteUser(userId: string) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return { message: "User deleted successfully" };
  },
};
