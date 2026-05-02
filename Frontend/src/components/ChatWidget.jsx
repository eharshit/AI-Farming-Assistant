import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageSquare, X, Send, ImagePlus, Sprout, Trash2,
  Wheat, CloudSun, TrendingUp, ShieldAlert
} from 'lucide-react';
import './ChatWidget.css';

const API_BASE = 'http://localhost:8000/api';
const STORAGE_KEY = 'agrisens_chat_history';

const QUICK_ACTIONS = [
  { icon: Wheat,       label: 'Get crop recommendation for loamy soil' },
  { icon: CloudSun,    label: 'Check 7-day weather for Pune' },
  { icon: TrendingUp,  label: 'Predict onion prices in Maharashtra' },
  { icon: ShieldAlert, label: 'How to treat tomato late blight' },
];

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>');
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const sendMessage = useCallback(async (overrideText) => {
    const text = (overrideText || input).trim();
    if (!text && !imageFile) return;
    if (isLoading) return;

    const userMsg = { role: 'user', content: text };
    if (imagePreview) userMsg.image = imagePreview;

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    let imageBase64 = null;
    if (imageFile) {
      try { imageBase64 = await readFileAsBase64(imageFile); } catch {}
    }
    setImageFile(null);
    setImagePreview(null);

    const historyForApi = [...messages, userMsg]
      .filter(m => !m.image)
      .slice(-6)
      .map(m => ({ role: m.role, content: m.content }));

    const botMsgId = Date.now();
    setMessages(prev => [...prev, { role: 'assistant', content: '', _id: botMsgId, _streaming: true }]);

    try {
      const response = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyForApi,
          image: imageBase64 || null,
        }),
      });

      if (!response.ok) throw new Error(`Server error ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullReply = '';
      let suggestions = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') continue;

          try {
            const event = JSON.parse(payload);
            if (event.type === 'token') {
              fullReply += event.content;
              setMessages(prev =>
                prev.map(m => m._id === botMsgId ? { ...m, content: fullReply } : m)
              );
            } else if (event.type === 'done') {
              suggestions = event.suggested_actions || [];
            } else if (event.type === 'error') {
              fullReply = event.content || 'Request failed.';
              setMessages(prev =>
                prev.map(m => m._id === botMsgId ? { ...m, content: fullReply } : m)
              );
            }
          } catch {}
        }
      }

      setMessages(prev =>
        prev.map(m =>
          m._id === botMsgId
            ? { ...m, content: fullReply || 'No response.', _streaming: false, suggestions }
            : m
        )
      );
    } catch {
      try {
        const res = await fetch(`${API_BASE}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: historyForApi,
            image: imageBase64 || null,
          }),
        });
        const data = await res.json();
        setMessages(prev =>
          prev.map(m =>
            m._id === botMsgId
              ? { ...m, content: data.reply || 'Request failed.', _streaming: false, suggestions: data.suggested_actions || [] }
              : m
          )
        );
      } catch {
        setMessages(prev =>
          prev.map(m =>
            m._id === botMsgId
              ? { ...m, content: 'Unable to reach server. Verify the backend is running on port 8000.', _streaming: false }
              : m
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [input, imageFile, imagePreview, messages, isLoading]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    try { setImagePreview(await readFileAsBase64(file)); } catch {}
    e.target.value = '';
  };

  const clearChat = () => {
    setMessages([]);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const showWelcome = messages.length === 0;

  return (
    <>
      <button
        id="chat-toggle-btn"
        className={`chat-fab ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open assistant"
      >
        <MessageSquare size={22} />
      </button>

      {isOpen && (
        <div className="chat-window" role="dialog" aria-label="Krishi Mitra Chat">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-header-icon">
                <Sprout size={16} />
              </div>
              <p className="chat-header-title">Krishi Mitra</p>
            </div>
            <div className="chat-header-actions">
              {messages.length > 0 && (
                <button
                  className="chat-header-btn"
                  onClick={clearChat}
                  title="Clear conversation"
                  aria-label="Clear conversation"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <button
                className="chat-header-btn primary"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {showWelcome && (
              <div className="chat-welcome">
                <p className="chat-welcome-text">
                  Get crop advice, detect diseases, or check market prices.
                </p>
                <div className="chat-actions-list">
                  {QUICK_ACTIONS.map((action, i) => (
                    <button
                      key={i}
                      className="chat-action-btn"
                      onClick={() => sendMessage(action.label)}
                    >
                      <div className="action-icon">
                        <action.icon size={15} />
                      </div>
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <React.Fragment key={msg._id || idx}>
                <div className={`chat-msg ${msg.role === 'user' ? 'user' : 'bot'}`}>
                  {msg.image && (
                    <img src={msg.image} alt="Uploaded leaf" className="msg-image" />
                  )}
                  <div
                    className="msg-bubble"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                  />
                </div>

                {msg.role === 'assistant' && msg.suggestions?.length > 0 && !msg._streaming && (
                  <div className="chat-suggestions">
                    {msg.suggestions.map((s, si) => (
                      <button
                        key={si}
                        className="suggestion-chip"
                        onClick={() => sendMessage(s.label)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}

            {isLoading && messages[messages.length - 1]?.content === '' && (
              <div className="typing-indicator">
                <span className="typing-label">Processing</span>
                <div className="typing-dots">
                  <span /><span /><span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-area">
            {imagePreview && (
              <div className="chat-image-strip">
                <img src={imagePreview} alt="Attached" />
                <span>Leaf image attached</span>
                <button onClick={() => { setImageFile(null); setImagePreview(null); }}>
                  Remove
                </button>
              </div>
            )}
            <div className="chat-input-row">
              <input
                ref={inputRef}
                type="text"
                className="chat-text-input"
                placeholder="Ask about crops, weather, or prices..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                id="chat-input"
              />
              <button
                className="chat-icon-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Attach leaf image for disease detection"
                aria-label="Attach image"
              >
                <ImagePlus size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              <button
                className="chat-send-btn"
                onClick={() => sendMessage()}
                disabled={isLoading || (!input.trim() && !imageFile)}
                aria-label="Send"
                id="chat-send-btn"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
