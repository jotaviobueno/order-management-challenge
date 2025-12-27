import { User } from "../models/user";
import { IUser } from "../types/user.types";
import { CreateUserDTO } from "../dtos/user.dto";

export class UserRepository {
  create(data: CreateUserDTO): Promise<IUser> {
    const user = new User({
      ...data,
      deletedAt: null,
    });
    return user.save();
  }

  getByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email, deletedAt: null }).select("+password");
  }

  getById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  findAll(): Promise<IUser[]> {
    return User.find({ deletedAt: null });
  }

  update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, data, { new: true });
  }

  softDelete(id: string): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await User.findOne({ email, deletedAt: null });
    return !!user;
  }
}
