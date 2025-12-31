import { describe, it, expect } from "vitest";
import { OrderStateMachine } from "./order-state-machine";
import { OrderState } from "../types/enums";
import { BadRequestException } from "../exceptions";

describe("OrderStateMachine", () => {
  describe("canTransition", () => {
    it("deve permitir transição de CREATED para ANALYSIS", () => {
      expect(OrderStateMachine.canTransition(OrderState.CREATED, OrderState.ANALYSIS)).toBe(true);
    });

    it("deve permitir transição de ANALYSIS para COMPLETED", () => {
      expect(OrderStateMachine.canTransition(OrderState.ANALYSIS, OrderState.COMPLETED)).toBe(true);
    });

    it("deve impedir transição de CREATED para COMPLETED", () => {
      expect(OrderStateMachine.canTransition(OrderState.CREATED, OrderState.COMPLETED)).toBe(false);
    });

    it("deve impedir transição de COMPLETED para qualquer estado", () => {
      expect(OrderStateMachine.canTransition(OrderState.COMPLETED, OrderState.CREATED)).toBe(false);
      expect(OrderStateMachine.canTransition(OrderState.COMPLETED, OrderState.ANALYSIS)).toBe(
        false
      );
      expect(OrderStateMachine.canTransition(OrderState.COMPLETED, OrderState.COMPLETED)).toBe(
        false
      );
    });

    it("deve impedir transição de ANALYSIS para CREATED", () => {
      expect(OrderStateMachine.canTransition(OrderState.ANALYSIS, OrderState.CREATED)).toBe(false);
    });

    it("deve impedir transição para o mesmo estado", () => {
      expect(OrderStateMachine.canTransition(OrderState.CREATED, OrderState.CREATED)).toBe(false);
      expect(OrderStateMachine.canTransition(OrderState.ANALYSIS, OrderState.ANALYSIS)).toBe(false);
      expect(OrderStateMachine.canTransition(OrderState.COMPLETED, OrderState.COMPLETED)).toBe(
        false
      );
    });
  });

  describe("getNextState", () => {
    it("deve retornar ANALYSIS como próximo estado de CREATED", () => {
      expect(OrderStateMachine.getNextState(OrderState.CREATED)).toBe(OrderState.ANALYSIS);
    });

    it("deve retornar COMPLETED como próximo estado de ANALYSIS", () => {
      expect(OrderStateMachine.getNextState(OrderState.ANALYSIS)).toBe(OrderState.COMPLETED);
    });

    it("deve retornar null para estado COMPLETED", () => {
      expect(OrderStateMachine.getNextState(OrderState.COMPLETED)).toBe(null);
    });
  });

  describe("advance", () => {
    it("deve avançar de CREATED para ANALYSIS", () => {
      const nextState = OrderStateMachine.advance(OrderState.CREATED);
      expect(nextState).toBe(OrderState.ANALYSIS);
    });

    it("deve avançar de ANALYSIS para COMPLETED", () => {
      const nextState = OrderStateMachine.advance(OrderState.ANALYSIS);
      expect(nextState).toBe(OrderState.COMPLETED);
    });

    it("deve lançar BadRequestException ao tentar avançar de COMPLETED", () => {
      expect(() => OrderStateMachine.advance(OrderState.COMPLETED)).toThrow(BadRequestException);
      expect(() => OrderStateMachine.advance(OrderState.COMPLETED)).toThrow(
        "Pedido já está completo e não pode avançar mais"
      );
    });
  });

  describe("validateTransition", () => {
    it("não deve lançar erro para transição válida de CREATED para ANALYSIS", () => {
      expect(() =>
        OrderStateMachine.validateTransition(OrderState.CREATED, OrderState.ANALYSIS)
      ).not.toThrow();
    });

    it("não deve lançar erro para transição válida de ANALYSIS para COMPLETED", () => {
      expect(() =>
        OrderStateMachine.validateTransition(OrderState.ANALYSIS, OrderState.COMPLETED)
      ).not.toThrow();
    });

    it("deve lançar BadRequestException para transição inválida de CREATED para COMPLETED", () => {
      expect(() =>
        OrderStateMachine.validateTransition(OrderState.CREATED, OrderState.COMPLETED)
      ).toThrow(BadRequestException);
      expect(() =>
        OrderStateMachine.validateTransition(OrderState.CREATED, OrderState.COMPLETED)
      ).toThrow("Transição inválida de CREATED para COMPLETED. Transições permitidas: ANALYSIS");
    });

    it("deve lançar BadRequestException para transição inválida de COMPLETED", () => {
      expect(() =>
        OrderStateMachine.validateTransition(OrderState.COMPLETED, OrderState.CREATED)
      ).toThrow(BadRequestException);
      expect(() =>
        OrderStateMachine.validateTransition(OrderState.COMPLETED, OrderState.CREATED)
      ).toThrow("Transição inválida de COMPLETED para CREATED. Transições permitidas: nenhuma");
    });

    it("deve lançar BadRequestException para transição para o mesmo estado", () => {
      expect(() =>
        OrderStateMachine.validateTransition(OrderState.CREATED, OrderState.CREATED)
      ).toThrow(BadRequestException);
      expect(() =>
        OrderStateMachine.validateTransition(OrderState.CREATED, OrderState.CREATED)
      ).toThrow("Transição inválida de CREATED para CREATED. Transições permitidas: ANALYSIS");
    });
  });

  describe("getAllowedTransitions", () => {
    it("deve retornar [ANALYSIS] para estado CREATED", () => {
      const transitions = OrderStateMachine.getAllowedTransitions(OrderState.CREATED);
      expect(transitions).toEqual([OrderState.ANALYSIS]);
    });

    it("deve retornar [COMPLETED] para estado ANALYSIS", () => {
      const transitions = OrderStateMachine.getAllowedTransitions(OrderState.ANALYSIS);
      expect(transitions).toEqual([OrderState.COMPLETED]);
    });

    it("deve retornar array vazio para estado COMPLETED", () => {
      const transitions = OrderStateMachine.getAllowedTransitions(OrderState.COMPLETED);
      expect(transitions).toEqual([]);
    });
  });

  describe("isFinalState", () => {
    it("deve retornar false para estado CREATED", () => {
      expect(OrderStateMachine.isFinalState(OrderState.CREATED)).toBe(false);
    });

    it("deve retornar false para estado ANALYSIS", () => {
      expect(OrderStateMachine.isFinalState(OrderState.ANALYSIS)).toBe(false);
    });

    it("deve retornar true para estado COMPLETED", () => {
      expect(OrderStateMachine.isFinalState(OrderState.COMPLETED)).toBe(true);
    });
  });

  describe("fluxo completo", () => {
    it("deve permitir fluxo completo do pedido", () => {
      let currentState = OrderState.CREATED;

      expect(OrderStateMachine.canTransition(currentState, OrderState.ANALYSIS)).toBe(true);
      currentState = OrderStateMachine.advance(currentState);
      expect(currentState).toBe(OrderState.ANALYSIS);

      expect(OrderStateMachine.canTransition(currentState, OrderState.COMPLETED)).toBe(true);
      currentState = OrderStateMachine.advance(currentState);
      expect(currentState).toBe(OrderState.COMPLETED);

      expect(OrderStateMachine.isFinalState(currentState)).toBe(true);
    });
  });
});
