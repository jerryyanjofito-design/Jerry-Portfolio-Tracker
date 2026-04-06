'use client'

import { useState } from 'react'
import { useDailyAnalysis, useCustomAnalysis, useChatMessage } from '@/hooks'
import { useAssets } from '@/hooks/use-assets'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading'
import { Badge } from '@/components/ui/badge'
import { formatIDR, formatPercentage } from '@/lib/utils/formatting'

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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#0052D4] to-[#0066FF] text-white py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            AI Analysis
          </h1>
          <p className="text-lg text-blue-100 mt-2">
            Get intelligent insights about your portfolio
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Assets Card */}
          <Card className="bg-white shadow-xl border border-gray-100 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                Total Assets
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {formatIDR(assets?.summary?.totalValue || 0)}
              </p>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Asset Count</span>
                <span className="font-semibold text-blue-600">
                  {assets?.assets?.length || 0} holdings
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Total Gain/Loss Card */}
          <Card className="bg-white shadow-xl border border-gray-100 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                Total Gain/Loss
              </p>
              <p
                className={`text-3xl font-bold ${
                  (assets?.summary?.totalGainLoss || 0) >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {formatIDR(assets?.summary?.totalGainLoss || 0)}
              </p>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Return</span>
                <span
                  className={`font-semibold ${
                    (assets?.summary?.totalGainLoss || 0) >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {formatPercentage(
                    (assets?.summary?.totalGainLoss || 0) / (assets?.summary?.totalValue || 1) * 100
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-2 flex gap-2">
          <button
            className={`flex-1 px-6 py-3 font-semibold rounded-xl transition-all duration-200 ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('chat')}
          >
            Chat Assistant
          </button>
          <button
            className={`flex-1 px-6 py-3 font-semibold rounded-xl transition-all duration-200 ${
              activeTab === 'custom'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('custom')}
          >
            Custom Analysis
          </button>
          <button
            className={`flex-1 px-6 py-3 font-semibold rounded-xl transition-all duration-200 ${
              activeTab === 'daily'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('daily')}
          >
            Daily Analysis
          </button>
        </div>

        {/* Chat Assistant Tab */}
        {activeTab === 'chat' && (
          <Card className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                Chat with AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Chat Messages */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                          : 'bg-white text-gray-900 border border-gray-200 shadow-md'
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
                    <div className="p-3 rounded-xl bg-gray-200">
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
                  className="flex-1 bg-white border-gray-200 focus:ring-2 focus:ring-blue-500"
                />
                <Button type="submit" disabled={chatMessage.isPending || !chatInput.trim()} className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
                  Send
                </Button>
              </form>

              {/* Suggested Questions */}
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2 font-semibold">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {['How is my diversification?', 'What should I rebalance?', 'Why is my portfolio down today?'].map((question) => (
                    <button
                      key={question}
                      onClick={() => setChatInput(question)}
                      className="px-3 py-1 text-sm bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full hover:from-blue-100 hover:to-blue-200 transition-all duration-200 border border-blue-200"
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
          <Card className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                Custom Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCustomAnalysis} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Assets (Optional)
                  </label>
                  {assets && assets.assets.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-2 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                      {assets.assets.slice(0, 12).map((asset: any) => (
                        <button
                          key={asset.id}
                          type="button"
                          onClick={() => toggleAssetSelection(asset.ticker)}
                          className={`p-2 text-left text-sm rounded-lg transition-all duration-200 ${
                            selectedAssets.includes(asset.ticker)
                              ? 'bg-gradient-to-r from-blue-100 to-blue-200 border-2 border-blue-600 shadow-md'
                              : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-blue-300'
                          }`}
                        >
                          <div className="font-bold">{asset.ticker}</div>
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
                  <label htmlFor="question" className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Question *
                  </label>
                  <textarea
                    id="question"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    placeholder="Ask a specific question about your portfolio or selected assets..."
                    className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={customAnalysis.isPending || !customQuestion.trim()} className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
                    {customAnalysis.isPending ? 'Analyzing...' : 'Get Analysis'}
                  </Button>
                </div>

                {customAnalysis.data && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded-xl shadow-md">
                    <h4 className="font-bold text-gray-900 mb-2">Analysis Result:</h4>
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
          <Card className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold text-gray-900">
                  Daily AI Analysis
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRefreshDaily}
                  disabled={dailyLoading}
                  className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600"
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
                      <h4 className="font-bold text-gray-900 mb-3">Key Insights:</h4>
                      <div className="space-y-2">
                        {dailyAnalysis.insights.topPerformers && dailyAnalysis.insights.topPerformers.length > 0 && (
                          <div>
                            <Badge variant="success" className="mb-1 font-semibold">Top Performers</Badge>
                            <div className="text-sm">
                              {dailyAnalysis.insights.topPerformers.map((p: any) => (
                                <div key={p.ticker} className="flex justify-between p-2 bg-green-50 rounded-lg">
                                  <span className="font-medium">{p.ticker} ({p.name || 'N/A'})</span>
                                  <span className="font-bold text-green-600">+{p.returnPercentage.toFixed(2)}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {dailyAnalysis.insights.worstPerformers && dailyAnalysis.insights.worstPerformers.length > 0 && (
                          <div>
                            <Badge variant="danger" className="mb-1 font-semibold">Areas of Concern</Badge>
                            <div className="text-sm">
                              {dailyAnalysis.insights.worstPerformers.map((p: any) => (
                                <div key={p.ticker} className="flex justify-between p-2 bg-red-50 rounded-lg">
                                  <span className="font-medium">{p.ticker} ({p.name || 'N/A'})</span>
                                  <span className="font-bold text-red-600">{p.returnPercentage.toFixed(2)}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="mt-4 text-sm text-gray-500 font-medium">
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
