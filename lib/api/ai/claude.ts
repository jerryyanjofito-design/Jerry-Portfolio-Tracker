import Anthropic from '@anthropic-ai/sdk'
import type { AIProvider, ChatMessage } from './types'

/**
 * Claude (Anthropic) AI Provider
 */
export class ClaudeProvider implements AIProvider {
  name = 'Claude'
  private client: Anthropic | null = null

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (apiKey) {
      this.client = new Anthropic({ apiKey })
    }
  }

  /**
   * Generate a response from Claude
   */
  async generateResponse(prompt: string, context?: any): Promise<string> {
    if (!this.client) {
      throw new Error('Claude client not initialized. Check ANTHROPIC_API_KEY.')
    }

    try {
      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      return message.content[0].type === 'text' ? message.content[0].text : ''
    } catch (error) {
      console.error('Error calling Claude API:', error)
      // Return a safe fallback instead of throwing
      return JSON.stringify({
        success: false,
        data: null,
        error: 'AI service temporarily unavailable'
      })
    }
  }

  /**
   * Generate a chat message response
   */
  async generateChatMessage(messages: ChatMessage[]): Promise<string> {
    if (!this.client) {
      throw new Error('Claude client not initialized. Check ANTHROPIC_API_KEY.')
    }

    try {
      // Convert our ChatMessage format to Anthropic's format
      const anthropicMessages = messages
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }))

      // Get system message if present
      const systemMessage = messages.find(msg => msg.role === 'system')?.content

      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemMessage,
        messages: anthropicMessages,
      })

      return response.content[0].type === 'text' ? response.content[0].text : ''
    } catch (error) {
      console.error('Error calling Claude chat API:', error)
      // Return a safe fallback instead of throwing
      return JSON.stringify({
        success: false,
        data: null,
        error: 'AI service temporarily unavailable'
      })
    }
  }

  /**
   * Check if the provider is available
   */
  isAvailable(): boolean {
    return this.client !== null
  }
}
