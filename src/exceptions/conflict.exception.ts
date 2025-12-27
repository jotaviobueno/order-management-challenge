import { HttpException } from "./http.exception";
import { HttpStatus } from "./http-status.enum";

export class ConflictException extends HttpException {
  constructor(message: string = "Conflict", details?: any) {
    super(message, HttpStatus.CONFLICT, details);
  }
}
