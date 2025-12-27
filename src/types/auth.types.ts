export interface IAuthPayload {
  sub: string;
  email: string;
}

export interface ILoginResponse {
  token: string;
}

export interface IAuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}
