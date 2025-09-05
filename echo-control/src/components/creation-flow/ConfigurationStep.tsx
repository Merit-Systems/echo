'use client';

import React from 'react';
import { Copy, ChevronRight, Check } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../ui/card';
import { Button } from '../ui/button';
import { BaseStepProps } from './types';
import { useCopyCode } from '@/hooks/useCopyCode';

interface ConfigurationStepProps extends BaseStepProps {
  createdAppId: string;
}

const ConfigurationStep = ({
  isTransitioning,
  createdAppId,
}: ConfigurationStepProps) => {
  const { handleCopyCode, isCopied } = useCopyCode();

  // Always can proceed from configuration step (it's informational)
  if (!createdAppId) {
    return (
      <div
        className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}
      >
        <div className="flex items-center space-x-3 mb-4 sm:mb-6">
          <ChevronRight className="h-5 w-5 text-primary" />
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
            Install Echo
          </h2>
        </div>

        <div className="relative mb-6 sm:mb-8">
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
              <CardTitle className="text-lg mb-2">
                Creating your Echo app...
              </CardTitle>
              <CardDescription>
                Please wait while we generate your configuration
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const createReactAppCommand =
    'npx create-react-app . --template typescript --yes';

  const installCommand = 'npm install @merit-systems/echo-react-sdk openai';

  const importsCode = `import {
  EchoProvider,
  useEcho,
  useEchoOpenAI,
  EchoSignIn,
  EchoTokens,
} from '@merit-systems/echo-react-sdk';
import { useState } from 'react';`;

  const configCode = `const echoConfig = {
  appId: '${createdAppId}',
  apiUrl: 'https://echo.merit.systems',
};`;

  const chatInterfaceCode = `function ChatInterface() {
  const { isAuthenticated } = useEcho()
  const { openai } = useEchoOpenAI()
  const [response, setResponse] = useState('')
  const [input, setInput] = useState('')

  const getMessage = async () => {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: input }],
    })
    setResponse(response.choices[0].message.content || '')
  }
  
  return (
    <div style={{
      display: 'flex', 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '.5rem',
      height: '50vh',
    }}>
      {isAuthenticated ? <EchoTokens /> : <EchoSignIn />}
      <input type="text" value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={getMessage}>Send Message</button>
      <p>{response}</p>
    </div>
  );
}`;

  const rootComponentCode = `function App() {
  return (
    <EchoProvider config={echoConfig}>
      <ChatInterface />
    </EchoProvider>
  );
}

export default App;`;

  const completeExampleCode = `${importsCode}

${configCode}

${chatInterfaceCode}

${rootComponentCode}`;

  return (
    <div
      className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}
    >
      <div className="flex items-center space-x-3 mb-4 sm:mb-6">
        <ChevronRight className="h-5 w-5 text-primary" />
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
          Install Echo
        </h2>
      </div>

      {/* Configuration Content */}
      <div className="relative mb-6 sm:mb-8">
        <div className="space-y-6 w-full">
          {/* Section 0: Create React App */}
          <Card className="w-full">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <CardTitle className="text-lg">
                  0. Create a new React app
                </CardTitle>
                <Button
                  variant="primaryOutline"
                  size="sm"
                  onClick={() =>
                    handleCopyCode(createReactAppCommand, 'create-react-app')
                  }
                  className={`transition-all duration-300 ${isCopied('create-react-app') ? 'bg-green-50 border-green-200 text-green-700 scale-105' : 'hover:scale-105'}`}
                >
                  {isCopied('create-react-app') ? (
                    <>
                      <Check className="h-4 w-4 mr-1 animate-pulse" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <CardDescription>
                We&apos;ll create a new React app to host our Echo app.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-foreground font-mono whitespace-pre-wrap break-words">
                  <code>{createReactAppCommand}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Section 1: Install Dependencies */}
          <Card className="w-full">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <CardTitle className="text-lg">
                  1. Install Dependencies
                </CardTitle>
                <Button
                  variant="primaryOutline"
                  size="sm"
                  onClick={() => handleCopyCode(installCommand, 'install-deps')}
                  className={`transition-all duration-300 ${isCopied('install-deps') ? 'bg-green-50 border-green-200 text-green-700 scale-105' : 'hover:scale-105'}`}
                >
                  {isCopied('install-deps') ? (
                    <>
                      <Check className="h-4 w-4 mr-1 animate-pulse" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <CardDescription>
                Install the Echo React SDK and OpenAI packages in your React
                app.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-foreground font-mono whitespace-pre-wrap break-words">
                  <code>{installCommand}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Import Libraries */}
          <Card className="w-full">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <CardTitle className="text-lg">2. Import Libraries</CardTitle>
                <Button
                  variant="primaryOutline"
                  size="sm"
                  onClick={() => handleCopyCode(importsCode, 'imports')}
                  className={`transition-all duration-300 ${isCopied('imports') ? 'bg-green-50 border-green-200 text-green-700 scale-105' : 'hover:scale-105'}`}
                >
                  {isCopied('imports') ? (
                    <>
                      <Check className="h-4 w-4 mr-1 animate-pulse" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <CardDescription>
                Import the necessary libraries at the top of your{' '}
                <code>App.tsx</code>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-foreground font-mono whitespace-pre-wrap break-words">
                  <code>{importsCode}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Configure Echo */}
          <Card className="w-full">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <CardTitle className="text-lg">3. Configure Echo</CardTitle>
                <Button
                  variant="primaryOutline"
                  size="sm"
                  onClick={() => handleCopyCode(configCode, 'config')}
                  className={`transition-all duration-300 ${isCopied('config') ? 'bg-green-50 border-green-200 text-green-700 scale-105' : 'hover:scale-105'}`}
                >
                  {isCopied('config') ? (
                    <>
                      <Check className="h-4 w-4 mr-1 animate-pulse" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <CardDescription>
                Set up the Echo configuration with your app ID and settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-foreground font-mono whitespace-pre-wrap break-words">
                  <code>{configCode}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Create Chat Interface */}
          <Card className="w-full">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <CardTitle className="text-lg">
                  4. Create Chat Interface
                </CardTitle>
                <Button
                  variant="primaryOutline"
                  size="sm"
                  onClick={() =>
                    handleCopyCode(chatInterfaceCode, 'chat-interface')
                  }
                  className={`transition-all duration-300 ${isCopied('chat-interface') ? 'bg-green-50 border-green-200 text-green-700 scale-105' : 'hover:scale-105'}`}
                >
                  {isCopied('chat-interface') ? (
                    <>
                      <Check className="h-4 w-4 mr-1 animate-pulse" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <CardDescription>
                Build a simple chat interface that uses Echo authentication and
                OpenAI.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-foreground font-mono whitespace-pre-wrap break-words">
                  <code>{chatInterfaceCode}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Root Component */}
          <Card className="w-full">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <CardTitle className="text-lg">
                  5. Set Up Root Component
                </CardTitle>
                <Button
                  variant="primaryOutline"
                  size="sm"
                  onClick={() =>
                    handleCopyCode(rootComponentCode, 'root-component')
                  }
                  className={`transition-all duration-300 ${isCopied('root-component') ? 'bg-green-50 border-green-200 text-green-700 scale-105' : 'hover:scale-105'}`}
                >
                  {isCopied('root-component') ? (
                    <>
                      <Check className="h-4 w-4 mr-1 animate-pulse" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <CardDescription>
                Wrap your app with the EchoProvider to enable Echo
                functionality.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-foreground font-mono whitespace-pre-wrap break-words">
                  <code>{rootComponentCode}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Section 6: Complete Example */}
          <Card className="w-full border-primary/30 bg-primary/5">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <CardTitle className="text-lg text-primary">
                  Complete Example
                </CardTitle>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    handleCopyCode(completeExampleCode, 'complete-example')
                  }
                  className={`transition-all duration-300 ${isCopied('complete-example') ? 'bg-green-100 border-green-300 text-green-800 scale-105' : 'hover:scale-105'}`}
                >
                  {isCopied('complete-example') ? (
                    <>
                      <Check className="h-4 w-4 mr-1 animate-pulse" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy All
                    </>
                  )}
                </Button>
              </div>
              <CardDescription>
                Here&apos;s the complete code combining all the pieces above.
                Copy and Paste into <code>App.tsx</code> to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-lg p-4 overflow-x-auto max-h-96">
                <pre className="text-sm text-foreground font-mono whitespace-pre-wrap break-words">
                  <code>{completeExampleCode}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationStep;
