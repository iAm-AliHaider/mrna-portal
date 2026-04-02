import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../../supabaseClient";
import InputField from "../../components/common/FormikInputField/Input";

const ChatBox = ({ senderId, receiverId, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "end",
        inline: "nearest"
      });
    }
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("private_messages")
      .select("*")
      .in("sender_id", [senderId, receiverId])
      .in("receiver_id", [senderId, receiverId])
      .order("sent_at", { ascending: true });

    if (!error) setMessages(data);
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel("private_messages_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "private_messages",
        },
        (payload) => {
          const msg = payload.new;
          if (
            (msg.sender_id === senderId && msg.receiver_id === receiverId) ||
            (msg.sender_id === receiverId && msg.receiver_id === senderId)
          ) {
            setMessages((prev) => [...prev, msg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [senderId, receiverId]);

  useEffect(() => {
    // Small delay to ensure DOM is updated before scrolling
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const { error } = await supabase.from("private_messages").insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content: newMessage.trim(),
    });

    if (!error) {
      setNewMessage("");
      if (onMessageSent) onMessageSent();
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

    return (
      <div className="border border-gray-300 rounded-lg max-w-2xl h-[500px] flex flex-col bg-gray-50 shadow-sm">
        {/* Messages Container */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto p-4 scroll-smooth"
          style={{ 
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 #f1f5f9'
          }}
          onScroll={(e) => {
            // Prevent event bubbling to avoid affecting page scroll
            e.stopPropagation();
          }}
        >
          <div className="space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === senderId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm
                    ${msg.sender_id === senderId 
                      ? 'bg-blue-500 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                    }
                    shadow-sm
                  `}
                >
                  <p className="break-words">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} className="h-0" />
          </div>
        </div>
  
        {/* Input Container */}
        <div className="flex items-center gap-2 p-4 border-t border-gray-200 bg-white rounded-b-lg">
          <div className="flex-1">
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className={`
              px-4 py-2 rounded-md font-medium text-sm transition-colors
              ${newMessage.trim() 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Send
          </button>
        </div>
      </div>
    );
};

export default ChatBox;
