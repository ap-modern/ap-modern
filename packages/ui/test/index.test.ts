import { Button } from '../src/index';

describe('Button', () => {
  it('should create a button with label', () => {
    const button = new Button({ label: 'Click me' });
    expect(button.render()).toBe('<button>Click me</button>');
  });

  it('should call onClick when clicked', () => {
    const onClick = jest.fn();
    const button = new Button({ label: 'Click me', onClick });
    button.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should calculate sum using utils', () => {
    const button = new Button({ label: 'Test' });
    expect(button.calculateSum(2, 3)).toBe(5);
  });
});
