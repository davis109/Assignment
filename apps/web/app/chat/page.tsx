"use client";

import { ChatInterface } from "@/components/chat/chat-interface";

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Chat with Data</h1>
        <p className="mt-2 text-gray-600">Ask questions about your invoices in natural language</p>
      </div>

      <ChatInterface />
    </div>
  );
}
