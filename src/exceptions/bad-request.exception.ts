import { HttpException } from "./http.exception";
import { HttpStatus } from "./http-status.enum";

export class BadRequestException extends HttpException {
  constructor(message: string = "Bad Request", details?: any) {
    super(message, HttpStatus.BAD_REQUEST, details);
  }
}
