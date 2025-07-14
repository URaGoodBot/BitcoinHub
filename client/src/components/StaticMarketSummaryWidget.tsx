import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, Bot, User } from "lucide-react";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const StaticMarketSummaryWidget = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I can help you understand the Bitcoin data on this website and answer general questions about cryptocurrency markets. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');

  const quickQuestions = [
    "What's the current Bitcoin price trend?",
    "Explain the Fear & Greed Index",
    "How does Fed policy affect Bitcoin?",
    "What is Bitcoin dominance?"
  ];

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Static responses for the static website
    const staticResponses = {
      "What's the current Bitcoin price trend?": "Based on the current data, Bitcoin is trading around $120,154 with a 2.34% daily increase. The price shows bullish momentum with strong support levels.",
      "Explain the Fear & Greed Index": "The Fear & Greed Index currently shows 74 (Greed), indicating positive market sentiment. Values above 70 typically suggest bullish conditions.",
      "How does Fed policy affect Bitcoin?": "Federal Reserve policy impacts Bitcoin through interest rates and monetary policy. Current rates at 4.33% provide context for Bitcoin's appeal as an alternative asset.",
      "What is Bitcoin dominance?": "Bitcoin dominance is currently 62.5%, showing Bitcoin's market share relative to all cryptocurrencies. Higher dominance indicates Bitcoin's strength in the crypto market."
    };

    const response = staticResponses[input as keyof typeof staticResponses] || 
      "I can help you understand the Bitcoin metrics displayed on this dashboard. Please ask about specific data points or Bitcoin concepts.";

    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + '_assistant',
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);

    setInput('');
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <span>Bitcoin AI Assistant</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-64 overflow-y-auto space-y-3 p-3 bg-muted/30 rounded-lg">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-start space-x-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-2 rounded-lg max-w-[80%] ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-background border'
              }`}>
                <div className="flex items-center space-x-1 mb-1">
                  {message.role === 'assistant' ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                  <span className="text-xs opacity-70">
                    {message.role === 'assistant' ? 'AI' : 'You'}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickQuestion(question)}
                className="text-xs"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Bitcoin data or markets..."
            className="min-h-[60px] resize-none"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!input.trim()}
            className="px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StaticMarketSummaryWidget;