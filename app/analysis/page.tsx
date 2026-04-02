'use client'

import { useState } from 'react'
import { useDailyAnalysis, useCustomAnalysis, useChatMessage } from '@/hooks'
import { useAssets } from '@/hooks/use-assets'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading'
import { Badge } from '@/components/ui/badge'

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'custom' | 'daily'>('chat')
  const [customQuestion, setCustomQuestion] = useState('')
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])

  const { data: assets } = useAssets()
  const { data: dailyAnalysis, isLoading: dailyLoading, refetch } = useDailyAnalysis()
  const customAnalysis = useCustomAnalysis()
  const chatMessage = useChatMessage()

  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([
    { role: 'system', content: 'I\'m your AI portfolio assistant. Ask me anything about your portfolio!' },
  ])
  const [chatInput, setChatInput] = useState('')

  const handleCustomAnalysis = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customQuestion.trim()) return

    await customAnalysis.mutateAsync({
      question: customQuestion,
      assets: selectedAssets.length > 0 ? selectedAssets : undefined,
    })

    setCustomQuestion('')
    setSelectedAssets([])
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMessage = chatInput
    setChatInput('')

    // Add user message
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      const response = await chatMessage.mutateAsync({
        message: userMessage,
        messages: chatMessages,
      })

      // Add AI response
      setChatMessages(prev => [...prev, { role: 'assistant', content: response.response }])
    } catch (error) {
      console.error('Chat error:', error)
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    }
  }

  const toggleAssetSelection = (ticker: string) => {
    setSelectedAssets(prev =>
      prev.includes(ticker)
        ? prev.filter(t => t !== ticker)
        : [...prev, ticker]
    )
  }

  const handleRefreshDaily = async () => {
    await refetch()
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900">
          AI Analysis
        </h1>
        <p className="text-gray-600 mt-1">
          Get intelligent insights about your portfolio
        </p>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'chat'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('chat')}
          >
            Chat Assistant
          </button>
          <button
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'custom'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('custom')}
          >
            Custom Analysis
          </button>
          <button
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'daily'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('daily')}
          >
            Daily Analysis
          </button>
        </div>

        {/* Chat Assistant Tab */}
        {activeTab === 'chat' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-700">
                Chat with AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Chat Messages */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      {message.role === 'system' ? (
                        <p className="text-sm text-gray-600">{message.content}</p>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                {chatMessage.isPending && (
                  <div className="flex justify-start">
                    <div className="p-3 rounded-lg bg-gray-200">
                      <LoadingSpinner size="sm" />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <Input
                  placeholder="Ask about your portfolio..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={chatMessage.isPending || !chatInput.trim()}>
                  Send
                </Button>
              </form>

              {/* Suggested Questions */}
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {['How is my diversification?', 'What should I rebalance?', 'Why is my portfolio down today?'].map((question) => (
                    <button
                      key={question}
                      onClick={() => setChatInput(question)}
                      className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Custom Analysis Tab */}
        {activeTab === 'custom' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-700">
                Custom Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCustomAnalysis} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Assets (Optional)
                  </label>
                  {assets && assets.assets.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-2 bg-gray-50 rounded-lg">
                      {assets.assets.slice(0, 12).map((asset: any) => (
                        <button
                          key={asset.id}
                          type="button"
                          onClick={() => toggleAssetSelection(asset.ticker)}
                          className={`p-2 text-left text-sm rounded transition-colors ${
                            selectedAssets.includes(asset.ticker)
                              ? 'bg-blue-100 border-2 border-blue-600'
                              : 'bg-white border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-medium">{asset.ticker}</div>
                          <div className="text-xs text-gray-600">{asset.name || 'N/A'}</div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-4">
                      No assets available
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Question *
                  </label>
                  <textarea
                    id="question"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    placeholder="Ask a specific question about your portfolio or selected assets..."
                    className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={customAnalysis.isPending || !customQuestion.trim()}>
                    {customAnalysis.isPending ? 'Analyzing...' : 'Get Analysis'}
                  </Button>
                </div>

                {customAnalysis.data && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Analysis Result:</h4>
                    <div className="prose prose-sm max-w-none text-gray-700">
                      {customAnalysis.data.analysis}
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        )}

        {/* Daily Analysis Tab */}
        {activeTab === 'daily' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-gray-700">
                  Daily AI Analysis
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRefreshDaily}
                  disabled={dailyLoading}
                >
                  {dailyLoading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {dailyLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : dailyAnalysis ? (
                <div className="prose prose-sm max-w-none text-gray-700">
                  <div className="whitespace-pre-wrap">{dailyAnalysis.analysis}</div>
                  {dailyAnalysis.insights && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Key Insights:</h4>
                      <div className="space-y-2">
                        {dailyAnalysis.insights.topPerformers && dailyAnalysis.insights.topPerformers.length > 0 && (
                          <div>
                            <Badge variant="success" className="mb-1">Top Performers</Badge>
                            <div className="text-sm">
                              {dailyAnalysis.insights.topPerformers.map((p: any) => (
                                <div key={p.ticker} className="flex justify-between">
                                  <span>{p.ticker} ({p.name || 'N/A'})</span>
                                  <span className="font-medium">+{p.returnPercentage.toFixed(2)}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {dailyAnalysis.insights.worstPerformers && dailyAnalysis.insights.worstPerformers.length > 0 && (
                          <div>
                            <Badge variant="danger" className="mb-1">Areas of Concern</Badge>
                            <div className="text-sm">
                              {dailyAnalysis.insights.worstPerformers.map((p: any) => (
                                <div key={p.ticker} className="flex justify-between">
                                  <span>{p.ticker} ({p.name || 'N/A'})</span>
                                  <span className="font-medium">{p.returnPercentage.toFixed(2)}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="mt-4 text-sm text-gray-500">
                    Generated at: {new Date(dailyAnalysis.generated_at).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No daily analysis available yet
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
