import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const JWTUtil = {
  sign(payload: object, expiresIn: string = "1h") {
    return (jwt as any).sign(payload, JWT_SECRET, { expiresIn });
  },

  signRefresh(payload: object, expiresIn: string = "7d") {
    return (jwt as any).sign(payload, JWT_REFRESH_SECRET, { expiresIn });
  },

  verify(token: string) {
    return jwt.verify(token, JWT_SECRET);
  },

  verifyRefresh(token: string) {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  },
};
