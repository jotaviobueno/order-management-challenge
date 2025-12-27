import { HttpException } from "./http.exception";
import { HttpStatus } from "./http-status.enum";

export class NotFoundException extends HttpException {
  constructor(message: string = "Not Found", details?: any) {
    super(message, HttpStatus.NOT_FOUND, details);
  }
}
