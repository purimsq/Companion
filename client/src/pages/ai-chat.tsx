import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import FloatingAddButton from "@/components/floating-add-button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot, User, Lightbulb, BookOpen, Calendar, Target, Loader2 } from "lucide-react";

interface ChatMessage {
  id: number;
  content: string;
  role: "user" | "assistant";
  createdAt: string;
}

interface ChatResponse {
  message: ChatMessage;
  suggestions?: string[];
}

export default function AIChat() {
  const [inputMessage, setInputMessage] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: messages, isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages"],
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/chat", { message });
      return response.json() as Promise<ChatResponse>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      setSuggestions(data.suggestions || []);
      setInputMessage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;
    chatMutation.mutate(message);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const quickActions = [
    { label: "Create study plan", icon: Calendar, action: "Create a study plan for this week based on my upcoming assignments" },
    { label: "Quiz me", icon: Target, action: "Create a quiz on my most recent study materials" },
    { label: "Summarize notes", icon: BookOpen, action: "Summarize my latest notes and highlight key concepts" },
    { label: "Study tips", icon: Lightbulb, action: "Give me some study tips for better focus and retention" },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-cream">
        <Sidebar />
        <div className="ml-64 flex-1">
          <Header />
          <main className="p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-warm-beige rounded-lg w-48 mb-8"></div>
              <div className="h-96 bg-warm-beige rounded-2xl"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      <div className="ml-64 flex-1">
        <Header />
        <main className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-charcoal mb-2">AI Study Companion</h1>
              <p className="text-soft-black/70">Get help with your studies, create plans, and ask questions</p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-white shadow-soft border-0 h-[calc(100vh-280px)] flex flex-col">
              <CardHeader className="border-b border-warm-beige">
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-soft-golden" />
                  <span>StudyCompanion AI</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages Area */}
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-6">
                    {messages && messages.length === 0 && (
                      <div className="text-center py-8">
                        <Bot className="w-16 h-16 text-soft-golden/30 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-charcoal mb-2">Hi Mitch! 👋</h3>
                        <p className="text-soft-black/70 mb-6 max-w-md mx-auto">
                          I'm here to help you with your studies. You can ask me questions, request summaries, 
                          create study plans, or get quizzes on your materials.
                        </p>
                        
                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                          {quickActions.map((action) => (
                            <Button
                              key={action.label}
                              variant="outline"
                              size="sm"
                              onClick={() => handleSuggestionClick(action.action)}
                              className="flex items-center space-x-2 h-auto p-3 text-left justify-start"
                              disabled={chatMutation.isPending}
                            >
                              <action.icon className="w-4 h-4 text-soft-golden" />
                              <span className="text-sm">{action.label}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {messages?.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start space-x-3 ${
                          message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === "user" 
                            ? "bg-soft-golden text-white" 
                            : "bg-muted-sage/20 text-muted-sage"
                        }`}>
                          {message.role === "user" ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Bot className="w-4 h-4" />
                          )}
                        </div>
                        <div className={`max-w-[80%] ${
                          message.role === "user" ? "text-right" : ""
                        }`}>
                          <div className={`inline-block p-4 rounded-2xl ${
                            message.role === "user"
                              ? "bg-soft-golden text-white"
                              : "bg-warm-beige text-charcoal"
                          }`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                          <p className="text-xs text-soft-black/50 mt-1 px-1">
                            {new Date(message.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))}

                    {chatMutation.isPending && (
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-muted-sage/20 text-muted-sage flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-warm-beige text-charcoal p-4 rounded-2xl">
                          <div className="flex items-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="px-6 py-3 border-t border-warm-beige">
                    <p className="text-xs text-soft-black/60 mb-2">Suggestions:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-soft-golden hover:text-white transition-colors"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="p-6 border-t border-warm-beige">
                  <form onSubmit={handleSubmit} className="flex space-x-3">
                    <Input
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask me anything about your studies..."
                      className="flex-1 focus-warm"
                      disabled={chatMutation.isPending}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-soft-golden hover:bg-warning-soft text-white px-6"
                      disabled={chatMutation.isPending || !inputMessage.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                  <p className="text-xs text-soft-black/50 mt-2">
                    I can help with summaries, study plans, quizzes, and answering questions about your materials.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <FloatingAddButton />
    </div>
  );
}
