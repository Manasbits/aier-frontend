// components/ChatInterface.jsx
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

// Styled wrapper components
const Heading1 = ({children}) => <h1 className="text-xl font-bold mb-4">{children}</h1>;
const Heading2 = ({children}) => <h2 className="text-lg font-bold mb-3">{children}</h2>;
const Heading3 = ({children}) => <h3 className="text-base font-bold mb-2">{children}</h3>;
const Paragraph = ({children}) => <p className="mb-4 leading-relaxed">{children}</p>;
const UnorderedList = ({children}) => <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>;
const OrderedList = ({children}) => <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>;
const ListItem = ({children}) => <li className="mb-1">{children}</li>;
const Table = ({children}) => (
  <div className="overflow-x-auto mb-4">
    <table className="min-w-full divide-y divide-gray-300">{children}</table>
  </div>
);
const TableHead = ({children}) => <thead className="bg-gray-50">{children}</thead>;
const TableBody = ({children}) => <tbody className="divide-y divide-gray-200">{children}</tbody>;
const TableRow = ({children}) => <tr>{children}</tr>;
const TableHeader = ({children}) => <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{children}</th>;
const TableCell = ({children}) => <td className="px-3 py-2 whitespace-nowrap text-sm">{children}</td>;
const PreBlock = ({children}) => <pre className="bg-gray-50 rounded-lg p-3 mb-4 overflow-x-auto">{children}</pre>;
const CodeBlock = ({children}) => <code className="bg-gray-50 rounded px-1 py-0.5 text-sm font-mono">{children}</code>;
const BlockQuote = ({children}) => <blockquote className="border-l-4 border-gray-200 pl-4 italic my-4">{children}</blockquote>;

// Update MarkdownComponents to use wrapper components
const MarkdownComponents = {
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  p: Paragraph,
  ul: UnorderedList,
  ol: OrderedList,
  li: ListItem,
  table: Table,
  thead: TableHead,
  tbody: TableBody,
  tr: TableRow,
  th: TableHeader,
  td: TableCell,
  pre: PreBlock,
  code: CodeBlock,
  blockquote: BlockQuote,
};

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('lite'); // Add mode state
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const [userId] = useState('user_123');

  const scrollRef = useRef(null);
  const composerRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: msg, ts: Date.now(), key: crypto.randomUUID?.() ?? Date.now() }]);
    setInput('');
    setIsLoading(true);

    // Micro animation on send
    try {
      composerRef.current?.animate?.(
        [
          { transform: 'translateY(0px)' },
          { transform: 'translateY(2px)' },
          { transform: 'translateY(0px)' }
        ],
        { duration: 180, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }
      );
    } catch {}

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, session_id: sessionId, user_id: userId }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const content = typeof data?.content === 'string' ? data.content : '(no content)';

      // Stagger-in micro animation for assistant bubble
      const key = crypto.randomUUID?.() ?? Date.now();
      setMessages(prev => [...prev, { role: 'assistant', content, ts: Date.now(), key }]);
      requestAnimationFrame(() => {
        const node = document.querySelector(`[data-msg-key="${key}"]`);
        node?.animate?.(
          [
            { opacity: 0, transform: 'translateY(10px) scale(0.98)' },
            { opacity: 1, transform: 'translateY(0px) scale(1)' },
          ],
          { duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
        );
      });
    } catch (e) {
      console.error('[UI] Error:', e);
      setMessages(prev => [...prev, { role: 'system', content: 'Error fetching response.', ts: Date.now(), key: crypto.randomUUID?.() ?? Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const fmtTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // First Launch View
  if (messages.length === 0) {
    return (
      <div className="min-h-dvh w-full bg-[#cad3d8] flex flex-col items-center justify-center p-4 relative">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8885_1px,transparent_1px),linear-gradient(to_bottom,#8885_1px,transparent_1px)] bg-[size:44px_44px]"
          style={{
            maskImage: 'radial-gradient(circle at center, transparent 0%, black 100%)',
            WebkitMaskImage: 'radial-gradient(circle at center, transparent 0%, black 100%)',
          }}
        />
        
        <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-6xl md:text-7xl font-bold text-gray-800 tracking-tight">
              AIER
            </h1>
            <p className="text-sm text-gray-600 font-medium">
              AI Equity Researcher
            </p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 transition-all border border-white/20 shadow-xl space-y-4">
            {/* Mode Selector */}
            <div className="flex gap-2 p-1 bg-gray-100/50 rounded-lg">
              <button
                onClick={() => setMode('lite')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === 'lite' 
                    ? 'bg-white shadow text-blue-600' 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Lite Mode
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 8L2 22" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17.5 15H9" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Expert Mode
                <span className="text-[10px] ml-1 bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">Soon</span>
              </button>
            </div>

            {/* Query Input */}
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about stocks (e.g., 'Analyze AAPL')"
              className="w-full resize-none bg-transparent text-lg text-gray-800 placeholder:text-gray-500 outline-none min-h-[60px] max-h-[200px]"
              autoFocus
            />
            <div className="flex justify-end">
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 rounded-xl bg-blue-500 text-white font-medium transition-all duration-200 disabled:opacity-50 hover:bg-blue-600 active:scale-95"
              >
                Ask Question
              </button>
            </div>
          </div>

          {/* Example Queries */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {/*
              "Should I buy Microsoft?",
              "Compare TataMotors and Mahindra",
              "Fundamental analysis of Adani Power",
              "Technical analysis of Reliance",
            */}
            {["Should I buy Microsoft?","Compare TataMotors and Mahindra","Fundamental analysis of Adani Power","Technical analysis of Reliance",].map((query, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(query);
                  composerRef.current?.querySelector('textarea')?.focus();
                }}
                className="px-4 py-2 rounded-full bg-white/50 hover:bg-white/80 text-gray-600 text-sm transition-all hover:scale-105"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Chat View (after first message)
  return (
    <div className="min-h-dvh w-full bg-[#cad3d8] flex flex-col relative">
      {/* Grid Background */}
      <div 
        className="fixed inset-0 bg-[linear-gradient(to_right,#8885_1px,transparent_1px),linear-gradient(to_bottom,#8885_1px,transparent_1px)] bg-[size:44px_44px]"
        style={{
          maskImage: 'radial-gradient(circle at center, transparent 0%, black 100%)',
          WebkitMaskImage: 'radial-gradient(circle at center, transparent 0%, black 100%)',
        }}
      />
      
      {/* Header */}
      <div className="relative py-4 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800">AIER</h1>
        <p className="text-xs text-gray-600">AI Equity Researcher</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div 
          ref={scrollRef}
          className="max-w-3xl mx-auto space-y-6"
        >
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.key ?? idx}
                data-msg-key={msg.key ?? idx}
                className={`flex items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-300`}
              >
                <div className={`max-w-[85%] px-5 py-3 rounded-2xl shadow-sm
                  ${isUser 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-800'
                  }`}
                >
                  <div className="break-words">
                    {isUser ? (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown components={MarkdownComponents}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                    {msg.ts && (
                      <div className={`mt-1 text-xs ${isUser ? 'text-blue-100' : 'text-gray-400'}`}>
                        {fmtTime(msg.ts)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-full bg-white/80 px-4 py-2 text-gray-800 flex items-center gap-2">
                <div className="size-2 rounded-full bg-blue-500 animate-bounce" />
                <span>Analyzing...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="p-4 animate-in fade-in slide-in-from-bottom-4">
        <div className="max-w-3xl mx-auto">
          <div ref={composerRef} className="flex items-end gap-2">
            <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask a question..."
                className="w-full resize-none bg-transparent px-4 py-3 text-gray-800 placeholder:text-gray-500 outline-none min-h-[44px] max-h-[160px]"
                rows={1}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="p-3 rounded-xl bg-blue-500 text-white transition-all disabled:opacity-50 hover:bg-blue-600 active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="size-6" fill="currentColor">
                <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2 .01 7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}