import OpenAI from 'openai'
import type { AIProvider, ChatMessage } from './types'

/**
 * OpenAI AI Provider
 */
export class OpenAIProvider implements AIProvider {
  name = 'OpenAI'
  private client: OpenAI | null = null

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (apiKey) {
      this.client = new OpenAI({ apiKey })
    }
  }

  /**
   * Generate a response from OpenAI
   */
  async generateResponse(prompt: string, context?: any): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized. Check OPENAI_API_KEY.')
    }

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1024,
      })

      return response.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('Error calling OpenAI API:', error)
      throw error
    }
  }

  /**
   * Generate a chat message response
   */
  async generateChatMessage(messages: ChatMessage[]): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized. Check OPENAI_API_KEY.')
    }

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages.map(msg => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content,
        })),
        max_tokens: 1024,
      })

      return response.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('Error calling OpenAI chat API:', error)
      throw error
    }
  }

  /**
   * Check if the provider is available
   */
  isAvailable(): boolean {
    return this.client !== null
  }
}
