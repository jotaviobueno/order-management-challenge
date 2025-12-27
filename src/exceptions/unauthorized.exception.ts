import { HttpException } from "./http.exception";
import { HttpStatus } from "./http-status.enum";

export class UnauthorizedException extends HttpException {
  constructor(message: string = "Unauthorized", details?: any) {
    super(message, HttpStatus.UNAUTHORIZED, details);
  }
}
