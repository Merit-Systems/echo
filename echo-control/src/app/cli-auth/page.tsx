'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Copy, Check, Terminal, Key } from 'lucide-react'

interface EchoApp {
  id: string
  name: string
  description?: string
}

export default function CLIAuthPage() {
  const { user, isLoaded } = useUser()
  const [apps, setApps] = useState<EchoApp[]>([])
  const [selectedAppId, setSelectedAppId] = useState<string>('')
  const [apiKeyName, setApiKeyName] = useState('CLI Access')
  const [generatedApiKey, setGeneratedApiKey] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isLoaded && user) {
      fetchApps()
    }
  }, [isLoaded, user])

  const fetchApps = async () => {
    try {
      const response = await fetch('/api/echo-apps')
      if (response.ok) {
        const data = await response.json()
        setApps(data.echoApps)
        if (data.echoApps.length > 0) {
          setSelectedAppId(data.echoApps[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch apps:', error)
    }
  }

  const generateApiKey = async () => {
    if (!selectedAppId) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          echoAppId: selectedAppId,
          name: apiKeyName,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedApiKey(data.apiKey.key)
      } else {
        console.error('Failed to generate API key')
      }
    } catch (error) {
      console.error('Failed to generate API key:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedApiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-card rounded-lg border border-border p-6 w-full max-w-md">
          <div className="text-center">
            <Terminal className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-card-foreground mb-2">CLI Authentication</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to generate an API key for CLI access.
            </p>
            <a
              href="/sign-in"
              className="inline-flex items-center justify-center px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-card-foreground flex items-center gap-3">
          <Terminal className="w-8 h-8" />
          CLI Authentication
        </h1>
        <p className="text-muted-foreground mt-2">
          Generate an API key to authenticate with the Echo CLI
        </p>
      </div>

      {!generatedApiKey ? (
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-2 mb-6">
            <Key className="w-5 h-5" />
            <h2 className="text-lg font-semibold text-card-foreground">Generate API Key</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="app-select" className="block text-sm font-medium text-card-foreground mb-2">
                Select Echo App
              </label>
              <select
                id="app-select"
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-input text-input-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Choose an app</option>
                {apps.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name}
                  </option>
                ))}
              </select>
              {apps.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  No apps found. Create an app first in your{' '}
                  <a href="/" className="text-accent hover:underline">
                    dashboard
                  </a>
                  .
                </p>
              )}
            </div>

            <div>
              <label htmlFor="api-key-name" className="block text-sm font-medium text-card-foreground mb-2">
                API Key Name
              </label>
              <input
                id="api-key-name"
                type="text"
                value={apiKeyName}
                onChange={(e) => setApiKeyName(e.target.value)}
                placeholder="Enter a name for this API key"
                className="w-full px-3 py-2 border border-input bg-input text-input-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-accent placeholder-muted-foreground"
              />
            </div>

            <button
              onClick={generateApiKey}
              disabled={!selectedAppId || isGenerating}
              className="w-full px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? 'Generating...' : 'Generate API Key'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-2 text-green-600 mb-6">
            <Check className="w-5 h-5" />
            <h2 className="text-lg font-semibold">API Key Generated</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Your API Key
              </label>
              <div className="flex items-center gap-2">
                <textarea
                  value={generatedApiKey}
                  readOnly
                  className="flex-1 px-3 py-2 border border-input bg-input text-input-foreground rounded-md font-mono text-sm resize-none"
                  rows={3}
                />
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-2 border border-input bg-input text-input-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Important Security Notice</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Keep this API key secure and never share it publicly</li>
                <li>• This key provides access to your Echo account</li>
                <li>• Store it safely in your CLI tool</li>
                <li>• You won't be able to see this key again after leaving this page</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Next Steps</h3>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. Copy the API key above</li>
                <li>2. Return to your terminal</li>
                <li>3. Paste the API key when prompted</li>
                <li>4. Start using the Echo CLI!</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setGeneratedApiKey('')}
                className="flex-1 px-4 py-2 border border-input bg-input text-input-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Generate Another Key
              </button>
              <a
                href="/"
                className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors text-center"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 