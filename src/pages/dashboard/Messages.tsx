import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Search } from 'lucide-react'
import { useState } from 'react'

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState(0)

  const chats = [
    {
      id: 1,
      name: 'Premium Retail Store',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=store1',
      lastMessage: 'When can I get the next shipment?',
      unread: 2,
      time: '2:30 PM',
    },
    {
      id: 2,
      name: 'Distribution Hub',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hub1',
      lastMessage: 'Order confirmed, shipping tomorrow',
      unread: 0,
      time: '10:15 AM',
    },
    {
      id: 3,
      name: 'Factory Manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=factory1',
      lastMessage: 'Production update available',
      unread: 1,
      time: 'Yesterday',
    },
  ]

  const messages = [
    {
      id: 1,
      sender: 'other',
      content: 'Hi, I need to place an order for next week',
      time: '2:15 PM',
    },
    {
      id: 2,
      sender: 'self',
      content: 'Sure! What products do you need?',
      time: '2:18 PM',
    },
    {
      id: 3,
      sender: 'other',
      content: 'I need 500 units of wheat flour and 200 liters of oil',
      time: '2:25 PM',
    },
    {
      id: 4,
      sender: 'self',
      content: 'Let me check our inventory and confirm availability',
      time: '2:28 PM',
    },
    {
      id: 5,
      sender: 'other',
      content: 'When can I get the next shipment?',
      time: '2:30 PM',
    },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Messages</h1>
        <p className="text-muted-foreground">Direct communication with your network</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        {/* Chat List */}
        <Card className="border border-border bg-card flex flex-col lg:col-span-1">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search chats..."
                className="pl-10 bg-background border-input"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chats.map((chat, index) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(index)}
                className={`w-full p-4 border-b border-border/50 text-left transition-colors hover:bg-muted ${
                  selectedChat === index ? 'bg-primary/10 border-primary' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">
                      {chat.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {chat.lastMessage}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{chat.time}</p>
                    {chat.unread > 0 && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Chat Window */}
        <Card className="border border-border bg-card flex flex-col lg:col-span-2">
          {/* Chat Header */}
          <div className="p-6 border-b border-border flex items-center gap-4">
            <img
              src={chats[selectedChat].avatar}
              alt={chats[selectedChat].name}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <h2 className="font-semibold text-foreground text-lg">
                {chats[selectedChat].name}
              </h2>
              <p className="text-sm text-muted-foreground">Active now</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'self' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.sender === 'self'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === 'self'
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-6 border-t border-border flex gap-2">
            <Input
              placeholder="Type your message..."
              className="flex-1 bg-background border-input"
            />
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
