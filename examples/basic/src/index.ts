import { Button } from '@ap/ui';
import { add, multiply } from '@ap/utils';

console.log('Basic Example Application');
console.log('========================');

// Using utils package
const sum = add(10, 20);
const product = multiply(5, 4);
console.log(`Sum: ${sum}`);
console.log(`Product: ${product}`);

// Using UI package
const button = new Button({
  label: 'Hello World',
  onClick: () => {
    console.log('Button clicked!');
  },
});

console.log(`Button HTML: ${button.render()}`);
button.click();
