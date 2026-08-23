import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env.local");
}

export interface TokenPayload extends JwtPayload {
  id: string;
  email: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): TokenPayload {
  if (!token || typeof token !== "string") {
    throw new Error("Invalid token");
  }

  return jwt.verify(token, JWT_SECRET) as unknown as TokenPayload;
}