import { IUserResponse } from "./user.types";

export interface IAuthPayload {
  sub: string;
  email: string;
}

export interface ILoginResponse {
  token: string;
}

export interface IAuthResponse {
  token: string;
  user: IUserResponse;
}
