import React, { useEffect, useMemo, useState } from 'react';
import { MessageSquare, Search, Send } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/stores/auth.store';
import { useMessageStore } from '@/stores/message.store';
import { cn } from '@/lib/utils';

const formatTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const MessagesPage: React.FC = () => {
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const currentUser = useAuthStore((state) => state.user);
  const {
    conversations,
    conversationMessages,
    currentConversationUserId,
    isLoading,
    isSending,
    error,
    fetchUserMessages,
    fetchConversation,
    sendMessage,
    markAsRead,
    setCurrentConversation,
  } = useMessageStore();

  useEffect(() => {
    void fetchUserMessages();
  }, [fetchUserMessages]);

  useEffect(() => {
    if (!currentConversationUserId && conversations.length > 0) {
      setCurrentConversation(conversations[0].participant_id);
    }
  }, [conversations, currentConversationUserId, setCurrentConversation]);

  useEffect(() => {
    if (currentConversationUserId) {
      void fetchConversation(currentConversationUserId);
    }
  }, [currentConversationUserId, fetchConversation]);

  useEffect(() => {
    if (!currentUser?.id || !conversationMessages.length) return;
    const unreadIds = conversationMessages
      .filter((msg) => msg.receiver_id === currentUser.id && !msg.is_read)
      .map((msg) => msg.id);
    if (unreadIds.length) {
      void markAsRead(unreadIds);
    }
  }, [conversationMessages, currentUser?.id, markAsRead]);

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((conv) => conv.participant_name.toLowerCase().includes(query));
  }, [conversations, searchQuery]);

  const activeConversation = useMemo(
    () => conversations.find((conv) => conv.participant_id === currentConversationUserId) || null,
    [conversations, currentConversationUserId]
  );

  const handleSendMessage = async () => {
    const receiver_id = currentConversationUserId;
    const message = messageInput.trim();

    if (!receiver_id || !message) return;

    const sent = await sendMessage({ receiver_id, message });
    if (sent) setMessageInput('');
  };

  return (
    <div className="h-[calc(100vh-8rem)] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground mt-1">Chat with your trading partners</p>
        </div>
      </div>

      <Card className="h-[calc(100vh-12rem)] overflow-hidden">
        <div className="flex h-full">
          <div className="w-full md:w-80 border-r flex flex-col">
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation.participant_id}
                    onClick={() => setCurrentConversation(conversation.participant_id)}
                    className={cn(
                      'w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left',
                      currentConversationUserId === conversation.participant_id
                        ? 'bg-accent'
                        : 'hover:bg-accent/50'
                    )}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{getInitials(conversation.participant_name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold truncate">
                          {conversation.participant_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(conversation.last_message_time)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{conversation.last_message}</p>
                    </div>
                    {conversation.unread_count > 0 && (
                      <Badge className="h-5 min-w-5 px-1 flex items-center justify-center">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {activeConversation ? (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{getInitials(activeConversation.participant_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{activeConversation.participant_name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {isLoading ? 'Loading conversation...' : 'Connected'}
                    </p>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {conversationMessages.map((msg) => {
                    const mine = msg.sender_id === currentUser?.id;
                    return (
                      <div key={msg.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                        <div
                          className={cn(
                            'max-w-[75%] rounded-lg p-3',
                            mine ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          <p
                            className={cn(
                              'text-[11px] mt-1',
                              mine ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            )}
                          >
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <div className="flex items-end gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    className="min-h-[80px] resize-none"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void handleSendMessage();
                      }
                    }}
                  />
                  <Button onClick={() => void handleSendMessage()} disabled={!messageInput.trim() || isSending}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {error && <p className="text-xs text-destructive mt-2">{error}</p>}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No conversation selected</h3>
                <p className="text-muted-foreground">Pick a conversation to start messaging.</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MessagesPage;

