import { HttpStatus } from "./http-status.enum";

export class HttpException extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: HttpStatus,
    public readonly details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
