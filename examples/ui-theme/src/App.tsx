import React from 'react';
import Button from './components/Button';
import Input from './components/Input';
import Card from './components/Card';

function App() {
  return (
    <div className="min-h-screen bg-positive p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-text-primary mb-8">UI Theme Demo</h1>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-title">Buttons</h2>
          <div className="flex gap-4 flex-wrap">
            <Button variant="primary" size="medium">
              Primary Button
            </Button>
            <Button variant="secondary" size="medium">
              Secondary Button
            </Button>
            <Button variant="danger" size="medium">
              Danger Button
            </Button>
            <Button variant="gray" size="medium">
              Gray Button
            </Button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-title">Inputs</h2>
          <div className="space-y-4 max-w-md">
            <Input placeholder="Small input" size="small" />
            <Input placeholder="Medium input" size="medium" />
            <Input placeholder="Large input" size="large" />
            <Input placeholder="Disabled input" disabled />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-title">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card title="Card Title" content="This is a card component with theme variables." />
            <Card
              title="Another Card"
              content="Cards use theme colors and spacing from the generated Tailwind config."
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
