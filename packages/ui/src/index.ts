/**
 * UI components package
 */
import { add } from '@ap/utils';

export interface ButtonProps {
  label: string;
  onClick?: () => void;
}

export class Button {
  private label: string;
  private onClick?: () => void;

  constructor(props: ButtonProps) {
    this.label = props.label;
    this.onClick = props.onClick;
  }

  render(): string {
    return `<button>${this.label}</button>`;
  }

  click(): void {
    if (this.onClick) {
      this.onClick();
    }
  }

  // Example of using utils package
  calculateSum(a: number, b: number): number {
    return add(a, b);
  }
}
