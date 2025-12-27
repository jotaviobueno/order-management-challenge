import { IUser, IUserResponse } from "../types/user.types";

export class UserAdapter {
  toResponse(user: IUser): IUserResponse {
    return {
      id: user._id.toString(),
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  toResponseList(users: IUser[]): IUserResponse[] {
    return users.map((user) => this.toResponse(user));
  }
}
