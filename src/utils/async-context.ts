import { AsyncLocalStorage } from "async_hooks";
import { AlsContextNotFoundException } from "../exceptions";
import { DynamicContext } from "../types/context.types";

export class AlsService {
  private static readonly asyncLocalStorage =
    new AsyncLocalStorage<DynamicContext>();

  /**
   * Executa uma função com um novo contexto
   */
  static run<T>(context: DynamicContext, callback: () => T): T {
    return this.asyncLocalStorage.run(context, callback);
  }

  /**
   * Obtém todo o contexto atual
   */
  static getContext(): DynamicContext | undefined {
    return this.asyncLocalStorage.getStore();
  }

  /**
   * Obtém um valor específico do contexto
   */
  static get<T = any>(key: string): T | undefined {
    const context = this.asyncLocalStorage.getStore();
    return context?.[key] as T;
  }

  /**
   * Obtém um valor ou lança erro se não existir
   */
  static getOrThrowError<T = any>(key: string): T {
    const value = this.get(key);
    if (!value) {
      throw new AlsContextNotFoundException(key);
    }
    return value;
  }

  /**
   * Define um valor no contexto atual
   */
  static set(key: string, value: any): void {
    const context = this.asyncLocalStorage.getStore();
    if (context) {
      context[key] = value;
    }
  }

  /**
   * Verifica se há um contexto ativo
   */
  static hasContext(): boolean {
    return this.asyncLocalStorage.getStore() !== undefined;
  }

  /**
   * Verifica se uma chave existe no contexto
   */
  static has(key: string): boolean {
    const context = this.asyncLocalStorage.getStore();
    return context ? key in context : false;
  }

  /**
   * Remove uma chave do contexto
   */
  static delete(key: string): boolean {
    const context = this.asyncLocalStorage.getStore();
    if (context && key in context) {
      delete context[key];
      return true;
    }
    return false;
  }

  /**
   * Retorna todas as chaves do contexto
   */
  static keys(): string[] {
    const context = this.asyncLocalStorage.getStore();
    return context ? Object.keys(context) : [];
  }

  /**
   * Limpa todo o contexto
   */
  static clear(): void {
    const context = this.asyncLocalStorage.getStore();
    if (context) {
      Object.keys(context).forEach((key) => delete context[key]);
    }
  }

  /**
   * Merge dados no contexto existente
   */
  static merge(data: DynamicContext): void {
    const context = this.asyncLocalStorage.getStore();
    if (context) {
      Object.assign(context, data);
    }
  }
}
