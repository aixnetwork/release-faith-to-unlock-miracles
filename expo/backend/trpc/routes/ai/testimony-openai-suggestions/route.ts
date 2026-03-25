import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/trpc';

const OPENAI_API_KEY = 'sk-proj-RSsGhzIySV2pDUNfK2InT3BlbkFJuu4hVokns4fBuNwZ6l6O';

export const testimonyOpenAISuggestionsProcedure = publicProcedure
  .input(
    z.object({
      title: z.string(),
      content: z.string().optional(),
      category: z.string(),
      type: z.enum(['text', 'video']),
    })
  )
  .mutation(async ({ input }: { input: { title: string; content?: string; category: string; type: 'text' | 'video' } }) => {
    try {
      const { title, content, category, type } = input;

      const testimonyText = type === 'text' 
        ? (content?.trim() ? `${title}. ${content}` : `A testimony titled "${title}" about ${category.toLowerCase()}.`)
        : `This is a video testimony titled "${title}" about ${category.toLowerCase()}. The person is sharing their story through a YouTube video about ${category.toLowerCase()}.`;

      const prompt = `Based on this testimony about ${category}: "${testimonyText}"

Please provide:
1. A relevant Bible verse with reference that relates to this testimony
2. A worship song title and artist that connects to the themes
3. A brief explanation of why these suggestions fit the testimony

Format your response as JSON with keys: scripture, song, explanation`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful Christian AI assistant that provides thoughtful, biblical responses. Always be respectful, encouraging, and grounded in scripture. Respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(`AI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const completion = data.choices?.[0]?.message?.content || '';

      let suggestions;
      try {
        const jsonMatch = completion.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.log('Failed to parse JSON, using fallback parsing');
        const lines = completion.split('\n').filter((l: string) => l.trim());
        suggestions = {
          scripture: lines.find((l: string) => l.toLowerCase().includes('scripture') || l.match(/\d+:\d+/)) || "Psalm 23:1 - 'The Lord is my shepherd; I shall not want.'",
          song: lines.find((l: string) => l.toLowerCase().includes('song')) || "Amazing Grace - Traditional",
          explanation: "These suggestions reflect themes of God's faithfulness in your testimony."
        };
      }

      return {
        scripture: suggestions.scripture || "Psalm 23:1 - 'The Lord is my shepherd; I shall not want.'",
        song: suggestions.song || "Amazing Grace - Traditional",
        explanation: suggestions.explanation || "These suggestions reflect themes of God's faithfulness in your testimony."
      };
    } catch (error) {
      console.error('Error in testimony OpenAI suggestions:', error);
      
      return {
        scripture: "Psalm 23:1 - 'The Lord is my shepherd; I shall not want.'",
        song: "Amazing Grace - Traditional",
        explanation: "These are default suggestions. The AI service is currently unavailable, but you can still share your testimony."
      };
    }
  });
