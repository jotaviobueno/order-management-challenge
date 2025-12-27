import mongoose, { Schema } from "mongoose";
import { IUser } from "../types/user.types";

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email é obrigatório"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (email: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: "Email inválido",
      },
    },
    password: {
      type: String,
      required: [true, "Senha é obrigatória"],
      minlength: [6, "A senha deve ter no mínimo 6 caracteres"],
      select: false,
    },
    createdAt: {
      name: "created_at",
      type: Date,
      default: Date.now,
      required: false,
    },
    updatedAt: {
      name: "updated_at",
      type: Date,
      default: Date.now,
      required: false,
    },
    deletedAt: {
      name: "deleted_at",
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>("users", userSchema);
