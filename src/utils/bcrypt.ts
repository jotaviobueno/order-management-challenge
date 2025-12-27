import bcrypt from "bcryptjs";

export class BcryptService {
  private readonly SALT_ROUNDS = 10;

  hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
