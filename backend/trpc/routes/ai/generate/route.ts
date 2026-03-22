import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/trpc';

// Define the schema for the request body
const generateRequestSchema = z.object({
  prompt: z.string(),
  provider: z.string().optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(4000).optional(),
  type: z.enum(['prayer', 'devotional', 'scripture', 'general']).optional(),
});

// Define the schema for the response
const generateResponseSchema = z.object({
  content: z.string(),
  provider: z.string(),
  model: z.string().optional(),
  usage: z
    .object({
      promptTokens: z.number(),
      completionTokens: z.number(),
      totalTokens: z.number(),
    })
    .optional(),
});

export const generateProcedure = protectedProcedure
  .input(generateRequestSchema)
  .output(generateResponseSchema)
  .mutation(async ({ input, ctx }) => {
    try {
      const { prompt, provider = 'toolkit', model, temperature = 0.7, maxTokens = 1000, type = 'general' } = input;
      
      // Get user's connected integrations
      // In a real implementation, you would fetch this from the database
      const userIntegrations = new Map();
      
      // Add system context based on type
      let systemPrompt = 'You are a helpful Christian AI assistant that provides thoughtful, biblical responses. Always be respectful, encouraging, and grounded in scripture.';
      
      switch (type) {
        case 'prayer':
          systemPrompt += ' Focus on creating meaningful prayers that are biblically sound and spiritually uplifting.';
          break;
        case 'devotional':
          systemPrompt += ' Create devotional content that includes scripture, reflection, and practical application.';
          break;
        case 'scripture':
          systemPrompt += ' Provide biblical insights and commentary that are theologically sound and accessible.';
          break;
      }

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: prompt }
      ];

      // Use specific provider if available and configured
      if (provider !== 'toolkit' && userIntegrations.has(provider)) {
        return await generateWithProvider(provider, messages, {
          model,
          temperature,
          maxTokens,
          apiKey: userIntegrations.get(provider).apiKey,
        });
      }

      // Fallback to toolkit API
      return await generateWithToolkit(messages);
    } catch (error) {
      console.error('Error generating AI content:', error);
      throw new Error('Failed to generate AI response. Please try again later.');
    }
  });

async function generateWithProvider(
  provider: string,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  config: { model?: string; temperature: number; maxTokens: number; apiKey: string }
) {
  switch (provider) {
    case 'openai':
      return await callOpenAI(messages, config);
    case 'anthropic':
      return await callAnthropic(messages, config);
    case 'google':
      return await callGoogle(messages, config);
    case 'mistral':
      return await callMistral(messages, config);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

async function callOpenAI(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  config: { model?: string; temperature: number; maxTokens: number; apiKey: string }
) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || 'gpt-3.5-turbo',
      messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    provider: 'openai',
    model: config.model || 'gpt-3.5-turbo',
    usage: {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    },
  };
}

async function callAnthropic(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  config: { model?: string; temperature: number; maxTokens: number; apiKey: string }
) {
  const systemMessage = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model || 'claude-3-sonnet-20240229',
      messages: userMessages,
      system: systemMessage?.content,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.content[0].text,
    provider: 'anthropic',
    model: config.model || 'claude-3-sonnet-20240229',
    usage: {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    },
  };
}

async function callGoogle(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  config: { model?: string; temperature: number; maxTokens: number; apiKey: string }
) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.model || 'gemini-pro'}:generateContent?key=${config.apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: messages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
        generationConfig: {
          temperature: config.temperature,
          maxOutputTokens: config.maxTokens,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Google API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.candidates[0].content.parts[0].text,
    provider: 'google',
    model: config.model || 'gemini-pro',
    usage: {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    },
  };
}

async function callMistral(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  config: { model?: string; temperature: number; maxTokens: number; apiKey: string }
) {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || 'mistral-medium',
      messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    }),
  });

  if (!response.ok) {
    throw new Error(`Mistral API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    provider: 'mistral',
    model: config.model || 'mistral-medium',
    usage: {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    },
  };
}

async function generateWithToolkit(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
) {
  const response = await fetch('https://toolkit.rork.com/text/llm/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    throw new Error(`Toolkit API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.completion,
    provider: 'toolkit',
    usage: {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    },
  };
}