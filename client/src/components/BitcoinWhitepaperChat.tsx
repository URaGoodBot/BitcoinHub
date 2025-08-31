import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Bot, User, FileText, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatResponse {
  response: string;
  error?: string;
}

export function BitcoinWhitepaperChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your Bitcoin White Paper AI assistant. I can answer questions about Satoshi Nakamoto's original Bitcoin paper, explain concepts like proof-of-work, double-spending solutions, and the peer-to-peer electronic cash system. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const queryClient = useQueryClient();

  const chatMutation = useMutation({
    mutationFn: async (question: string): Promise<ChatResponse> => {
      const response = await fetch('/api/whitepaper-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      return response.json();
    },
    onSuccess: (data, question) => {
      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString() + '_user',
        role: 'user',
        content: question,
        timestamp: new Date()
      };

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + '_assistant',
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage, assistantMessage]);
      setInputMessage('');
    },
    onError: (error) => {
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '_error',
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your question. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim() || chatMutation.isPending) return;
    
    chatMutation.mutate(inputMessage.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200 dark:from-amber-950/20 dark:to-yellow-950/20 dark:border-amber-800 h-[600px] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
          <div className="p-2 bg-amber-600 rounded-lg">
            <FileText className="h-4 w-4 text-white" />
          </div>
          Bitcoin White Paper AI Assistant
          <Bot className="h-5 w-5 text-amber-600" />
        </CardTitle>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Ask questions about Satoshi's original Bitcoin paper and get AI-powered insights
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 bg-amber-600">
                    <AvatarFallback className="bg-amber-600 text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.role === 'user'
                      ? 'bg-amber-600 text-white'
                      : 'bg-white/70 dark:bg-gray-800/70 text-amber-900 dark:text-amber-100 border border-amber-200/50'
                  }`}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      message.role === 'user'
                        ? 'text-amber-100'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>

                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 bg-gray-600">
                    <AvatarFallback className="bg-gray-600 text-white">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {/* Loading indicator */}
            {chatMutation.isPending && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 bg-amber-600">
                  <AvatarFallback className="bg-amber-600 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white/70 dark:bg-gray-800/70 text-amber-900 dark:text-amber-100 border border-amber-200/50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="px-4 pb-4 pt-2 border-t border-amber-200/50">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about the Bitcoin white paper..."
              className="flex-1 bg-white/70 dark:bg-gray-800/70 border-amber-200 focus:border-amber-400"
              disabled={chatMutation.isPending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || chatMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {chatMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 mt-2 text-center">
            Powered by Grok AI • Press Enter to send
          </div>
        </div>
      </CardContent>
    </Card>
  );
}