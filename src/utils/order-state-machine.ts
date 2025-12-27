import { OrderState } from "../types/enums";
import { BadRequestException } from "../exceptions";

export class OrderStateMachine {
  private static readonly STATE_TRANSITIONS: Record<OrderState, OrderState[]> =
    {
      [OrderState.CREATED]: [OrderState.ANALYSIS],
      [OrderState.ANALYSIS]: [OrderState.COMPLETED],
      [OrderState.COMPLETED]: [],
    };

  static canTransition(
    currentState: OrderState,
    nextState: OrderState
  ): boolean {
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
        throw new BadRequestException(
          "Pedido já está completo e não pode avançar mais"
        );
      }
      throw new BadRequestException(
        `Não há próximo estado disponível para: ${currentState}`
      );
    }

    return nextState;
  }

  static validateTransition(
    currentState: OrderState,
    nextState: OrderState
  ): void {
    if (!this.canTransition(currentState, nextState)) {
      const allowedTransitions = this.STATE_TRANSITIONS[currentState];
      throw new BadRequestException(
        `Transição inválida de ${currentState} para ${nextState}. Transições permitidas: ${
          allowedTransitions.join(", ") || "nenhuma"
        }`
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
