import { User } from "../models/user";
import { IUser } from "../types/user.types";
import { CreateUserDto } from "../dtos/user.dto";
import { PaginationOptions, PaginatedResult } from "../types/pagination.types";

export class UserRepository {
  create(data: CreateUserDto): Promise<IUser> {
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

  async findAll(options: PaginationOptions): Promise<PaginatedResult<IUser>> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const filter = { deletedAt: null };

    const [data, totalItems] = await Promise.all([
      User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
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
