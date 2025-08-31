import OpenAI from "openai";

const openai = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY 
});

export async function analyzeWithGrok(prompt: string): Promise<string> {
  try {
    if (!process.env.XAI_API_KEY) {
      throw new Error('XAI_API_KEY not found in environment variables');
    }

    const response = await openai.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response content received from Grok');
    }

    return content;
  } catch (error) {
    console.error('Error calling Grok API:', error);
    
    if (error instanceof Error) {
      throw new Error(`Grok API error: ${error.message}`);
    }
    
    throw new Error('Unknown error occurred while calling Grok API');
  }
}

export async function analyzeSentiment(text: string): Promise<{
  rating: number,
  confidence: number
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "system",
          content: "You are a sentiment analysis expert. Analyze the sentiment of the text and provide a rating from 1 to 5 stars and a confidence score between 0 and 1. Respond with JSON in this format: { 'rating': number, 'confidence': number }"
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      rating: Math.max(1, Math.min(5, Math.round(result.rating))),
      confidence: Math.max(0, Math.min(1, result.confidence))
    };
  } catch (error) {
    throw new Error("Failed to analyze sentiment: " + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

export async function summarizeArticle(text: string): Promise<string> {
  const prompt = `Please summarize the following text concisely while maintaining key points:\n\n${text}`;

  const response = await openai.chat.completions.create({
    model: "grok-2-1212",
    messages: [{ role: "user", content: prompt }]
  });

  return response.choices[0].message.content || '';
}