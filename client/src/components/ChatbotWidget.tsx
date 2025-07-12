import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, Loader2, Bot, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatbotWidget = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I can help you understand the Bitcoin data on this website and answer general questions about cryptocurrency markets. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');

  const chatMutation = useMutation({
    mutationFn: async (question: string) => {
      return await apiRequest('/api/chatbot/ask', {
        method: 'POST',
        body: { question }
      });
    },
    onSuccess: (response) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + '_assistant',
        role: 'assistant',
        content: response.answer,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '_error',
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const handleSendMessage = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString() + '_user',
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(input.trim());
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "What's the current Bitcoin price?",
    "How is the market sentiment today?",
    "What are the key resistance levels?",
    "Tell me about Fed rates impact on Bitcoin"
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Bitcoin AI Assistant
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ask questions about website data and Bitcoin markets
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {/* Chat Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className={`flex gap-2 max-w-[80%] ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                  message.role === 'user' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-blue-500 text-white'
                }`}>
                  {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-orange-500 text-white'
                    : 'bg-muted'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {chatMutation.isPending && (
            <div className="flex gap-3 justify-start">
              <div className="flex gap-2 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Questions */}
        <div className="border-t p-4">
          <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
          <div className="grid grid-cols-1 gap-1">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="text-xs justify-start h-auto py-1 px-2"
                onClick={() => setInput(question)}
                disabled={chatMutation.isPending}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about Bitcoin data, market trends, or general crypto questions..."
              className="min-h-[60px] resize-none"
              disabled={chatMutation.isPending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || chatMutation.isPending}
              size="sm"
              className="px-3"
            >
              {chatMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatbotWidget;