import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function chatWithOpenAI(question: string): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not found in environment variables');
    }

    const systemPrompt = `You are the official AI assistant for Bitcoin Hub, a comprehensive Bitcoin information platform. You are knowledgeable, helpful, and focused on providing accurate information about Bitcoin, cryptocurrency markets, and the platform's features.

**About Bitcoin Hub Platform:**
- Real-time Bitcoin price tracking and market data
- News aggregation from trusted Bitcoin sources
- Educational content and interactive learning games
- Technical analysis tools and bull market indicators
- Trading indicators and market sentiment analysis
- Web resources including M2 money supply charts, liquidation heatmaps, Pi Cycle indicator, and Fear & Greed Index
- AI-powered market analysis and price predictions
- Truflation real-time inflation tracking
- Federal Reserve data and Treasury yields
- Crypto legislation tracker and policy analysis
- Interactive educational games for different generations
- Bitcoin white paper access and AI-powered explanations

**Your capabilities:**
- Answer questions about Bitcoin fundamentals, technology, and market dynamics
- Explain cryptocurrency concepts in accessible language
- Provide guidance on using Bitcoin Hub features
- Discuss market analysis, technical indicators, and trading concepts
- Share insights about Bitcoin adoption, regulation, and industry trends
- Help users navigate the platform and find relevant information
- Explain economic concepts related to Bitcoin (inflation, monetary policy, etc.)

**Guidelines:**
- Be helpful, informative, and professional
- Use clear, accessible language appropriate for users of all experience levels
- When discussing prices or predictions, emphasize that markets are volatile and unpredictable
- Encourage users to do their own research (DYOR)
- If asked about investment advice, remind users you're not a financial advisor
- Stay focused on Bitcoin and related topics
- Reference Bitcoin Hub features when relevant to user questions
- Provide educational value in every response

User question: ${question}

Please provide a helpful, informative response that assists the user while representing Bitcoin Hub professionally.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: question
        }
      ],
      max_tokens: 800,
      temperature: 0.7
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response content received from OpenAI');
    }

    return content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    
    if (error instanceof Error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
    
    throw new Error('Unknown error occurred while calling OpenAI API');
  }
}

// Additional utility functions for future use
export async function summarizeArticle(text: string): Promise<string> {
  const prompt = `Please summarize the following text concisely while maintaining key points:\n\n${text}`;

  const response = await openai.chat.completions.create({
    model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
    messages: [{ role: "user", content: prompt }]
  });

  return response.choices[0].message.content || '';
}

export async function analyzeSentiment(text: string): Promise<{
  rating: number,
  confidence: number
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
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