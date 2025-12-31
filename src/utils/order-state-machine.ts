import { OrderState } from "../types/enums";
import { HttpException, HttpStatus } from "../exceptions";

export class OrderStateMachine {
  private static readonly STATE_TRANSITIONS: Record<OrderState, OrderState[]> = {
    [OrderState.CREATED]: [OrderState.ANALYSIS],
    [OrderState.ANALYSIS]: [OrderState.COMPLETED],
    [OrderState.COMPLETED]: [],
  };

  static canTransition(currentState: OrderState, nextState: OrderState): boolean {
    const allowedTransitions = this.STATE_TRANSITIONS[currentState];
    return allowedTransitions.includes(nextState);
  }

  static getNextState(currentState: OrderState): OrderState | null {
    const allowedTransitions = this.STATE_TRANSITIONS[currentState];
    return allowedTransitions.length > 0 ? allowedTransitions[0] : null;
  }

  static advance(currentState: OrderState): OrderState {
    const nextState = this.getNextState(currentState);

    if (!nextState) {
      if (currentState === OrderState.COMPLETED) {
        throw new HttpException(
          "Pedido já está completo e não pode avançar mais",
          HttpStatus.BAD_REQUEST
        );
      }
      throw new HttpException(
        `Não há próximo estado disponível para: ${currentState}`,
        HttpStatus.BAD_REQUEST
      );
    }

    return nextState;
  }

  static validateTransition(currentState: OrderState, nextState: OrderState): void {
    if (!this.canTransition(currentState, nextState)) {
      const allowedTransitions = this.STATE_TRANSITIONS[currentState];
      throw new HttpException(
        `Transição inválida de ${currentState} para ${nextState}. Transições permitidas: ${
          allowedTransitions.join(", ") || "nenhuma"
        }`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  static getAllowedTransitions(currentState: OrderState): OrderState[] {
    return this.STATE_TRANSITIONS[currentState];
  }

  static isFinalState(state: OrderState): boolean {
    return this.STATE_TRANSITIONS[state].length === 0;
  }
}
