import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { IAuthPayload } from "../types/auth.types";

export class JwtService {
  static generate(payload: IAuthPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);
  }

  static verify(token: string): IAuthPayload {
    return jwt.verify(token, config.jwt.secret) as IAuthPayload;
  }
}
