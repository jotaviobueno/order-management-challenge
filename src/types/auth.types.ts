export interface IAuthPayload {
  userId: string;
  email: string;
}

export interface IAuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}
