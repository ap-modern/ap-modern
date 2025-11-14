import { test, expect } from '@playwright/test';
import { Button } from '../src/index';

test.describe('Button E2E', () => {
  test('should render button correctly', () => {
    const button = new Button({ label: 'Test Button' });
    const html = button.render();
    expect(html).toContain('Test Button');
    expect(html).toContain('<button>');
  });

  test('should handle click events', () => {
    let clicked = false;
    const button = new Button({
      label: 'Click me',
      onClick: () => {
        clicked = true;
      },
    });
    button.click();
    expect(clicked).toBe(true);
  });
});
