import { add, subtract, multiply, divide } from '../src/index';

describe('Utils', () => {
  describe('add', () => {
    it('should add two numbers correctly', () => {
      expect(add(2, 3)).toBe(5);
    });
  });

  describe('subtract', () => {
    it('should subtract two numbers correctly', () => {
      expect(subtract(5, 3)).toBe(2);
    });
  });

  describe('multiply', () => {
    it('should multiply two numbers correctly', () => {
      expect(multiply(2, 3)).toBe(6);
    });
  });

  describe('divide', () => {
    it('should divide two numbers correctly', () => {
      expect(divide(6, 3)).toBe(2);
    });

    it('should throw error when dividing by zero', () => {
      expect(() => divide(6, 0)).toThrow('Division by zero is not allowed');
    });
  });
});
