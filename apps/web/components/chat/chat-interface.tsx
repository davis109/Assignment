"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Send } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  sql?: string;
  results?: any[];
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.chatWithData(input);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response.answer || "Query executed successfully",
        sql: response.sql,
        results: response.results,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Sorry, I encountered an error processing your query. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Chat with Your Data</CardTitle>
          <p className="text-sm text-muted-foreground">
            Ask questions about your invoices in natural language
          </p>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <p className="text-lg mb-4">Ask me anything about your invoices!</p>
                <div className="text-sm space-y-2">
                  <p>Try asking:</p>
                  <ul className="list-disc list-inside">
                    <li>&quot;Show me all invoices from this month&quot;</li>
                    <li>&quot;What&apos;s the total amount I owe to Acme Corp?&quot;</li>
                    <li>&quot;Which vendor has the highest spend?&quot;</li>
                  </ul>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    
                    {message.sql && (
                      <div className="mt-2 p-2 bg-black/10 rounded text-xs font-mono">
                        <p className="font-semibold mb-1">SQL Query:</p>
                        <code>{message.sql}</code>
                      </div>
                    )}
                    
                    {message.results && message.results.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold mb-1">Results ({message.results.length}):</p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b">
                                {Object.keys(message.results[0]).map((key) => (
                                  <th key={key} className="text-left py-1 px-2">
                                    {key}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {message.results.slice(0, 5).map((row, idx) => (
                                <tr key={idx} className="border-b">
                                  {Object.values(row).map((value: any, vidx) => (
                                    <td key={vidx} className="py-1 px-2">
                                      {typeof value === "number" && value > 1000
                                        ? `$${value.toLocaleString()}`
                                        : String(value)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {message.results.length > 5 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              ...and {message.results.length - 5} more rows
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your invoices..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
            <Button onClick={handleSend} disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
