import { HttpException } from "./http.exception";
import { HttpStatus } from "./http-status.enum";

export class ForbiddenException extends HttpException {
  constructor(message: string = "Forbidden", details?: any) {
    super(message, HttpStatus.FORBIDDEN, details);
  }
}
