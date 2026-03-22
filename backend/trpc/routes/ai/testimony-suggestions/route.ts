import { z } from 'zod';
import { publicProcedure } from '../../../trpc';

const testimonySuggestionsSchema = z.object({
  testimony: z.string().min(10, 'Testimony must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
});

const aiSuggestionSchema = z.object({
  scripture: z.string(),
  song: z.string(),
  explanation: z.string(),
});

// Test procedure to verify tRPC connection
export const testConnectionProcedure = publicProcedure
  .query(() => {
    console.log('Test connection procedure called successfully');
    return { status: 'ok', message: 'tRPC connection working' };
  });

export const testimonySuggestionsProcedure = publicProcedure
  .input(testimonySuggestionsSchema)
  .output(aiSuggestionSchema)
  .mutation(async ({ input }) => {
    const { testimony, category } = input;

    // Fallback suggestions based on category
    const getFallbackSuggestions = (categoryKey: string) => {
      const fallbackSuggestions = {
        healing: {
          scripture: "Jeremiah 30:17 - 'For I will restore health to you, and your wounds I will heal, declares the Lord.'",
          song: "Healer - Kari Jobe",
          explanation: "This scripture speaks of God's healing power, and the song celebrates Jesus as our healer."
        },
        provision: {
          scripture: "Philippians 4:19 - 'And my God will supply every need of yours according to his riches in glory in Christ Jesus.'",
          song: "Jehovah Jireh - Avalon",
          explanation: "This verse promises God's provision, and the song celebrates God as our provider."
        },
        guidance: {
          scripture: "Proverbs 3:5-6 - 'Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.'",
          song: "Lead Me Lord - Sanctus Real",
          explanation: "This passage encourages trust in God's guidance, and the song asks for His direction."
        },
        salvation: {
          scripture: "Romans 10:9 - 'If you confess with your mouth that Jesus is Lord and believe in your heart that God raised him from the dead, you will be saved.'",
          song: "Amazing Grace - Traditional Hymn",
          explanation: "This verse explains salvation, and Amazing Grace celebrates God's saving grace."
        },
        protection: {
          scripture: "Psalm 91:11 - 'For he will command his angels concerning you to guard you in all your ways.'",
          song: "Surrounded (Fight My Battles) - UPPERROOM",
          explanation: "This psalm speaks of God's protection, and the song declares His surrounding presence."
        },
        breakthrough: {
          scripture: "Isaiah 43:19 - 'Behold, I am doing a new thing; now it springs forth, do you not perceive it? I will make a way in the wilderness and rivers in the desert.'",
          song: "Way Maker - Sinach",
          explanation: "This verse promises God's breakthrough power, and the song celebrates Him as our way maker."
        }
      };

      const categoryLower = categoryKey.toLowerCase() as keyof typeof fallbackSuggestions;
      return fallbackSuggestions[categoryLower] || fallbackSuggestions.guidance;
    };

    try {
      console.log('Generating AI suggestions for testimony:', { category, testimonyLength: testimony.length });
      
      // Call the AI service to get suggestions
      console.log('Making request to AI service with URL:', 'https://toolkit.rork.com/text/llm/');
      
      const requestBody = {
        messages: [
          {
            role: 'system',
            content: `You are a Christian AI assistant that helps believers find relevant scripture verses and worship songs that relate to their testimonies. 

Your task is to:
1. Suggest ONE relevant Bible verse with reference that relates to the testimony
2. Suggest ONE worship song (with artist if known) that relates to the testimony
3. Provide a brief explanation of why these suggestions are relevant

Format your response as JSON:
{
  "scripture": "Bible verse reference - 'verse text'",
  "song": "Song Title - Artist Name",
  "explanation": "Brief explanation of why these suggestions relate to the testimony"
}

Be encouraging, biblically sound, and relevant to the specific testimony shared.`
          },
          {
            role: 'user',
            content: `Please suggest a relevant scripture verse and worship song for this testimony in the "${category}" category:

"${testimony}"

Respond only with the JSON format requested.`
          }
        ]
      };
      
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('AI API response status:', response.status);
      console.log('AI API response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.error('AI API response not ok:', response.status, response.statusText);
        const errorText = await response.text().catch(() => 'Unable to read error response');
        console.error('AI API error response:', errorText);
        console.error('Full response object:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          headers: Object.fromEntries(response.headers.entries())
        });
        const fallback = getFallbackSuggestions(category);
        console.log('Using fallback suggestions for category:', category);
        return aiSuggestionSchema.parse(fallback);
      }

      const data = await response.json();
      console.log('AI API response data:', data);
      
      if (!data.completion) {
        console.error('No completion in AI response:', data);
        const fallback = getFallbackSuggestions(category);
        console.log('Using fallback suggestions due to missing completion');
        return aiSuggestionSchema.parse(fallback);
      }
      
      // Parse the AI response
      let suggestions;
      try {
        // Clean the response - remove any markdown formatting
        const cleanedCompletion = data.completion
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        console.log('Cleaned AI completion:', cleanedCompletion);
        suggestions = JSON.parse(cleanedCompletion);
        console.log('Parsed AI suggestions:', suggestions);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError, 'Raw completion:', data.completion);
        const fallback = getFallbackSuggestions(category);
        console.log('Using fallback suggestions due to parse error');
        return aiSuggestionSchema.parse(fallback);
      }

      // Ensure all required fields are present and valid
      const result = {
        scripture: (suggestions.scripture && typeof suggestions.scripture === 'string') 
          ? suggestions.scripture 
          : getFallbackSuggestions(category).scripture,
        song: (suggestions.song && typeof suggestions.song === 'string') 
          ? suggestions.song 
          : getFallbackSuggestions(category).song,
        explanation: (suggestions.explanation && typeof suggestions.explanation === 'string') 
          ? suggestions.explanation 
          : getFallbackSuggestions(category).explanation
      };

      // Validate the result matches our schema before returning
      console.log('Final result before validation:', result);
      const validatedResult = aiSuggestionSchema.parse(result);
      console.log('Successfully validated AI suggestions');
      return validatedResult;

    } catch (error) {
      console.error('Error generating testimony suggestions:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error detected - AI service may be unreachable');
      }
      
      const fallback = getFallbackSuggestions(category);
      console.log('Using fallback suggestions due to error:', fallback);
      return aiSuggestionSchema.parse(fallback);
    }
  });