export class MongoIdValidator {
  private static readonly MONGO_ID_REGEX = /^[a-f\d]{24}$/i;

  static isValid(id: string): boolean {
    return this.MONGO_ID_REGEX.test(id);
  }
}
