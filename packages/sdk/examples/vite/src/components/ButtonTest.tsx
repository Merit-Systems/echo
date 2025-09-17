import { EchoButton } from '@merit-systems/echo-react-sdk';

export function ButtonTest() {
  return (
    <div className="space-y-4 p-4 border rounded">
      <h1 className="text-xl font-bold">SDK Button Test</h1>
      <div className="flex gap-2">
        <EchoButton />
      </div>
    </div>
  );
}
