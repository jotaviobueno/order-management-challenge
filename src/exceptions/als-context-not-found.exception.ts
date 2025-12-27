export class AlsContextNotFoundException extends Error {
  constructor(key: string) {
    super(`Context key "${key}" not found in AsyncLocalStorage`);
    this.name = "AlsContextNotFoundException";
  }
}
