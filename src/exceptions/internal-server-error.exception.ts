import { HttpException } from "./http.exception";
import { HttpStatus } from "./http-status.enum";

export class InternalServerErrorException extends HttpException {
  constructor(message: string = "Internal Server Error", details?: any) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, details);
  }
}
