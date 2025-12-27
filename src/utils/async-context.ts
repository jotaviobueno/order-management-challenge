import { AsyncLocalStorage } from "async_hooks";
import { AlsContextNotFoundException } from "../exceptions";
import { DynamicContext } from "../types/context.types";

export class AlsService {
  private static readonly asyncLocalStorage =
    new AsyncLocalStorage<DynamicContext>();

  static run<T>(context: DynamicContext, callback: () => T): T {
    return this.asyncLocalStorage.run(context, callback);
  }

  static getContext(): DynamicContext | undefined {
    return this.asyncLocalStorage.getStore();
  }

  static get<T = any>(key: string): T | undefined {
    const context = this.asyncLocalStorage.getStore();
    return context?.[key] as T;
  }

  static getOrThrowError<T = any>(key: string): T {
    const value = this.get(key);
    if (!value) {
      throw new AlsContextNotFoundException(key);
    }
    return value;
  }

  static set(key: string, value: any): void {
    const context = this.asyncLocalStorage.getStore();
    if (context) {
      context[key] = value;
    }
  }

  static hasContext(): boolean {
    return this.asyncLocalStorage.getStore() !== undefined;
  }

  static has(key: string): boolean {
    const context = this.asyncLocalStorage.getStore();
    return context ? key in context : false;
  }

  static delete(key: string): boolean {
    const context = this.asyncLocalStorage.getStore();
    if (context && key in context) {
      delete context[key];
      return true;
    }
    return false;
  }

  static keys(): string[] {
    const context = this.asyncLocalStorage.getStore();
    return context ? Object.keys(context) : [];
  }

  static clear(): void {
    const context = this.asyncLocalStorage.getStore();
    if (context) {
      Object.keys(context).forEach((key) => delete context[key]);
    }
  }

  static merge(data: DynamicContext): void {
    const context = this.asyncLocalStorage.getStore();
    if (context) {
      Object.assign(context, data);
    }
  }
}
