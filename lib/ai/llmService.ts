interface LLMResponse {
  completion: string;
}

interface CoreMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

class LLMService {
  private baseUrl = 'https://toolkit.rork.com/text/llm/';
  private integrations: Map<string, LLMConfig> = new Map();

  // Configure integrations
  setIntegration(provider: string, config: LLMConfig) {
    this.integrations.set(provider, config);
  }

  removeIntegration(provider: string) {
    this.integrations.delete(provider);
  }

  getAvailableProviders(): string[] {
    return Array.from(this.integrations.keys());
  }

  async generateText(prompt: string, provider?: string): Promise<string> {
    try {
      // Use specific provider if available and configured
      if (provider && this.integrations.has(provider)) {
        return await this.generateWithProvider(prompt, provider);
      }

      // Fallback to toolkit API
      return await this.generateWithToolkit(prompt);
    } catch (error) {
      console.error('LLM Service Error:', error);
      throw new Error('Failed to generate content. Please try again.');
    }
  }

  private async generateWithProvider(prompt: string, provider: string): Promise<string> {
    const config = this.integrations.get(provider);
    if (!config?.apiKey) {
      throw new Error(`No API key configured for ${provider}`);
    }

    const messages: CoreMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful Christian AI assistant that provides thoughtful, biblical responses. Always be respectful, encouraging, and grounded in scripture. Keep responses concise but meaningful.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    switch (provider) {
      case 'openai':
        return await this.callOpenAI(messages, config);
      case 'anthropic':
        return await this.callAnthropic(messages, config);
      case 'google':
        return await this.callGoogle(messages, config);
      case 'mistral':
        return await this.callMistral(messages, config);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private async generateWithToolkit(prompt: string): Promise<string> {
    const messages: CoreMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful Christian AI assistant that provides thoughtful, biblical responses. Always be respectful, encouraging, and grounded in scripture. Keep responses concise but meaningful.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: LLMResponse = await response.json();
    return data.completion;
  }

  private async callOpenAI(messages: CoreMessage[], config: LLMConfig): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model || 'gpt-3.5-turbo',
        messages,
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async callAnthropic(messages: CoreMessage[], config: LLMConfig): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model || 'claude-3-sonnet-20240229',
        messages: messages.filter(m => m.role !== 'system'),
        system: messages.find(m => m.role === 'system')?.content,
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  private async callGoogle(messages: CoreMessage[], config: LLMConfig): Promise<string> {
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
            temperature: config.temperature || 0.7,
            maxOutputTokens: config.maxTokens || 1000,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  private async callMistral(messages: CoreMessage[], config: LLMConfig): Promise<string> {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model || 'mistral-medium',
        messages,
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async generatePrayer(topic: string, type: 'personal' | 'healing' | 'gratitude' | 'guidance' = 'personal', provider?: string): Promise<string> {
    const prayerPrompts = {
      personal: `Write a heartfelt personal prayer about: ${topic}`,
      healing: `Write a prayer for healing and comfort regarding: ${topic}`,
      gratitude: `Write a prayer of thanksgiving and gratitude for: ${topic}`,
      guidance: `Write a prayer seeking God's guidance and wisdom about: ${topic}`
    };

    const prompt = `${prayerPrompts[type]}

Please create a meaningful prayer that:
- Is appropriate for Christian faith
- Includes biblical themes and language
- Shows reverence and humility
- Offers hope and encouragement
- Ends with "In Jesus' name, Amen"
- Is 2-3 paragraphs long`;

    return this.generateText(prompt, provider);
  }

  async generateDevotional(topic: string, length: 'short' | 'medium' | 'long' = 'medium', provider?: string): Promise<string> {
    const lengthGuide = {
      short: '2-3 short paragraphs',
      medium: '4-5 paragraphs',
      long: '6-8 paragraphs'
    };

    const prompt = `Generate a ${lengthGuide[length]} devotional about: ${topic}

Please include:
- A relevant Bible verse at the beginning
- Thoughtful reflection on the topic
- Practical application for daily life
- A closing prayer or reflection question
- Encouraging and uplifting tone
- Biblical perspective throughout`;

    return this.generateText(prompt, provider);
  }

  async generateScriptureInsight(verse: string, provider?: string): Promise<string> {
    const prompt = `Provide thoughtful biblical insight and commentary on this scripture verse: "${verse}"

Please include:
- Historical and cultural context (briefly)
- Key theological themes
- Practical application for modern believers
- Connection to broader biblical narrative
- Encouraging and edifying perspective
- Keep it accessible and not overly academic`;

    return this.generateText(prompt, provider);
  }

  async generateTestimonyPrompts(category: string, provider?: string): Promise<string[]> {
    const prompt = `Generate 5 thoughtful prompts to help someone write a testimony about: ${category}

Each prompt should:
- Be encouraging and supportive
- Help the person reflect on God's work in their life
- Be specific enough to guide their writing
- Be appropriate for sharing in a Christian community
- Focus on God's faithfulness and goodness

Format as a simple numbered list.`;

    try {
      const response = await this.generateText(prompt, provider);
      
      // Parse the response into an array of prompts
      const prompts = response
        .split('\n')
        .filter(line => line.trim().match(/^\d+\./))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(prompt => prompt.length > 0);

      return prompts.length > 0 ? prompts : this.getFallbackPrompts(category);
    } catch (error) {
      console.error('Error generating testimony prompts:', error);
      return this.getFallbackPrompts(category);
    }
  }

  private getFallbackPrompts(category: string): string[] {
    const fallbackPrompts: { [key: string]: string[] } = {
      healing: [
        'Describe a time when God brought healing to your body, mind, or spirit.',
        'How did your faith sustain you during a difficult health challenge?',
        'What Bible verses gave you comfort during your healing journey?',
        'How has God used your experience to help others facing similar struggles?',
        'What did you learn about God\'s character through your healing process?'
      ],
      provision: [
        'Share about a time when God provided for your needs in an unexpected way.',
        'How has God\'s faithfulness been evident in your financial journey?',
        'Describe a moment when you experienced God\'s perfect timing in provision.',
        'What has trusting God with your needs taught you about His character?',
        'How has God used others to be His hands and feet in providing for you?'
      ],
      salvation: [
        'What led you to accept Jesus Christ as your Lord and Savior?',
        'How has your life changed since becoming a Christian?',
        'Who were the people God used to draw you to Himself?',
        'What Bible verse or passage was particularly meaningful in your salvation journey?',
        'How do you see God\'s hand working in your life before you knew Him?'
      ],
      default: [
        'How has God shown His faithfulness in your life?',
        'Describe a time when you experienced God\'s peace during difficulty.',
        'What Bible verse has been particularly meaningful to you and why?',
        'How has your relationship with God grown over the past year?',
        'Share about a prayer that God answered in an unexpected way.'
      ]
    };

    return fallbackPrompts[category.toLowerCase()] || fallbackPrompts.default;
  }

  async generateBibleStudyQuestions(passage: string, provider?: string): Promise<string[]> {
    const prompt = `Generate 6-8 thoughtful Bible study questions for this passage: "${passage}"

Include a mix of:
- Observation questions (What does the text say?)
- Interpretation questions (What does it mean?)
- Application questions (How does it apply to life today?)
- Make questions suitable for group discussion
- Encourage deeper reflection and personal growth

Format as a numbered list.`;

    try {
      const response = await this.generateText(prompt, provider);
      
      const questions = response
        .split('\n')
        .filter(line => line.trim().match(/^\d+\./))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(question => question.length > 0);

      return questions.length > 0 ? questions : [
        'What stands out to you most in this passage?',
        'What does this passage teach us about God\'s character?',
        'How does this passage challenge or encourage you?',
        'What practical steps can you take to apply this truth?',
        'How does this passage connect to other parts of Scripture?',
        'What questions does this passage raise for you?'
      ];
    } catch (error) {
      console.error('Error generating Bible study questions:', error);
      return [
        'What stands out to you most in this passage?',
        'What does this passage teach us about God\'s character?',
        'How does this passage challenge or encourage you?',
        'What practical steps can you take to apply this truth?'
      ];
    }
  }
}

export const llmService = new LLMService();