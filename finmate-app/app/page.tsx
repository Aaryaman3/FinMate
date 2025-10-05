'use client';

import { useRouter } from 'next/navigation';
import { EchoAuth } from '@/components/echo-auth';
import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function LandingPage() {
  const router = useRouter();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Chat functionality
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleChatOpen = () => setIsChatOpen(true);
  const handleChatClose = () => {
    setIsChatOpen(false);
    // Stop any ongoing speech
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice input using Web Speech API
  const handleVoiceInput = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsRecording(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsRecording(false);
      };
      
      recognition.onerror = () => {
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognition.start();
    }
  };

  // Text-to-speech using ElevenLabs
  const speakText = async (text: string) => {
    try {
      setIsSpeaking(true);
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('TTS failed');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
    } catch (error) {
      console.error('Error speaking:', error);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsSpeaking(false);
    }
  };

  // Navigation intent detection
  const detectNavigationIntent = (text: string): { intent: string; route: string } | null => {
    const lowerText = text.toLowerCase();
    
    // Remittance intents
    if (lowerText.includes('send money') || 
        lowerText.includes('transfer money') || 
        lowerText.includes('remittance') ||
        lowerText.includes('money home') ||
        lowerText.includes('send cash') ||
        lowerText.includes('wire transfer')) {
      return { intent: 'remittance', route: '/remittance' };
    }
    
    // Bank account intents
    if (lowerText.includes('bank account') || 
        lowerText.includes('open account') || 
        lowerText.includes('banking') ||
        lowerText.includes('compare banks') ||
        lowerText.includes('find bank')) {
      return { intent: 'banks', route: '/banks' };
    }
    
    // Receipt scanner intents
    if (lowerText.includes('scan receipt') || 
        lowerText.includes('receipt') || 
        lowerText.includes('expense') ||
        lowerText.includes('track spending') ||
        lowerText.includes('analyze purchase')) {
      return { intent: 'receipt', route: '/receipt' };
    }
    
    // Transparency intents
    if (lowerText.includes('transparency') || 
        lowerText.includes('how it works') || 
        lowerText.includes('ai transparency') ||
        lowerText.includes('show me how')) {
      return { intent: 'transparency', route: '/transparency' };
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue;
    setInputValue('');
    
    // Check for navigation intent first
    const navIntent = detectNavigationIntent(userMessage);
    
    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
    };
    setMessages(prev => [...prev, userMsg]);
    
    // If navigation intent detected, confirm and route
    if (navIntent) {
      const confirmMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sure! Taking you to ${navIntent.intent}...`,
      };
      setMessages(prev => [...prev, confirmMsg]);
      
      // Speak confirmation
      await speakText(confirmMsg.content);
      
      // Navigate after a brief delay
      setTimeout(() => {
        router.push(navIntent.route);
      }, 1500);
      
      return;
    }
    
    // Start AI response
    setIsLoading(true);
    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
    };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No response body');

      let fullResponse = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        fullResponse += text;
        
        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg.role === 'assistant') {
            updated[updated.length - 1] = {
              ...lastMsg,
              content: lastMsg.content + text
            };
          }
          return updated;
        });
      }
      
      // Auto-speak the response
      if (fullResponse) {
        await speakText(fullResponse);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        body {
          background-color: #FAF2E7;
          margin: 0;
          padding: 0;
        }

        .fintech-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 3rem;
          background-color: #FFFFFF;
          box-shadow: 0 2px 8px rgba(42, 49, 64, 0.08);
        }

        .fintech-logo-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .fintech-logo {
          width: 40px;
          height: 40px;
        }

        .fintech-brand {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2A3140;
        }

        .fintech-user-section {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .fintech-credits {
          font-size: 0.95rem;
          font-weight: 600;
          color: #2AA46A;
          padding: 0.5rem 1rem;
          background-color: #F0FDF4;
          border-radius: 18px;
        }

        .fintech-username {
          font-size: 0.95rem;
          font-weight: 600;
          color: #2A3140;
        }

        .fintech-hero {
          max-width: 1200px;
          margin: 0 auto;
          padding: 4rem 3rem;
          text-align: center;
        }

        .fintech-welcome {
          font-size: 3.5rem;
          font-weight: 700;
          color: #2A3140;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .fintech-motto {
          font-size: 1.25rem;
          font-weight: 500;
          color: #6B7280;
          max-width: 700px;
          margin: 0 auto 3rem;
          line-height: 1.6;
        }

        .fintech-cards-container {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          justify-content: center;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 3rem;
        }

        .fintech-card {
          flex: 1 1 280px;
          max-width: 320px;
          background-color: #FFFFFF;
          border-radius: 18px;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(42, 49, 64, 0.08);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .fintech-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(42, 49, 64, 0.12);
        }

        .fintech-card.featured {
          background: linear-gradient(135deg, #2AA46A 0%, #1D7A4D 100%);
          color: #FFFFFF;
        }

        .fintech-card.featured .fintech-card-title,
        .fintech-card.featured .fintech-card-description {
          color: #FFFFFF;
        }

        .fintech-card-icon {
          width: 48px;
          height: 48px;
          margin-bottom: 1rem;
          background-color: #F9A61B;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .fintech-card.featured .fintech-card-icon {
          background-color: rgba(255, 255, 255, 0.2);
        }

        .fintech-card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #2A3140;
          margin-bottom: 0.5rem;
        }

        .fintech-card-description {
          font-size: 0.95rem;
          font-weight: 500;
          color: #6B7280;
          line-height: 1.5;
          flex-grow: 1;
        }

        .fintech-badge {
          display: inline-block;
          background-color: #F9A61B;
          color: #FFFFFF;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          margin-top: 1rem;
        }

        .fintech-bottom-section {
          max-width: 1200px;
          margin: 4rem auto 0;
          padding: 3rem;
          display: flex;
          gap: 3rem;
          flex-wrap: wrap;
        }

        .fintech-column {
          flex: 1 1 300px;
          background-color: #EDECEA;
          border-radius: 18px;
          padding: 2.5rem;
        }

        .fintech-column-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #2A3140;
          margin-bottom: 1.5rem;
        }

        .fintech-column-content {
          font-size: 1rem;
          font-weight: 500;
          color: #6B7280;
          line-height: 1.8;
        }

        .fintech-column-content ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .fintech-column-content li {
          margin-bottom: 0.75rem;
          padding-left: 1.5rem;
          position: relative;
        }

        .fintech-column-content li:before {
          content: "•";
          color: #2AA46A;
          font-weight: bold;
          position: absolute;
          left: 0;
          font-size: 1.5rem;
          line-height: 1;
        }

        @media (max-width: 768px) {
          .fintech-header {
            padding: 1rem 1.5rem;
            flex-wrap: wrap;
            gap: 1rem;
          }

          .fintech-hero {
            padding: 2rem 1.5rem;
          }

          .fintech-welcome {
            font-size: 2.5rem;
          }

          .fintech-motto {
            font-size: 1.1rem;
          }

          .fintech-cards-container {
            padding: 0 1.5rem;
          }

          .fintech-bottom-section {
            padding: 1.5rem;
            gap: 1.5rem;
          }
        }

        /* Chatbot Animations */
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes wave {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-8px);
          }
        }

        @keyframes recording {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
          }
        }

        /* Scrollbar styling for chat */
        .chat-messages::-webkit-scrollbar {
          width: 8px;
        }

        .chat-messages::-webkit-scrollbar-track {
          background: #FAF2E7;
        }

        .chat-messages::-webkit-scrollbar-thumb {
          background: #C29454;
          border-radius: 4px;
        }

        .chat-messages::-webkit-scrollbar-thumb:hover {
          background: #A67C3B;
        }

        /* Chatbot Mobile Responsiveness */
        @media (max-width: 768px) {
          .chatbot-dialog {
            width: 90vw !important;
            height: 70vh !important;
            bottom: 20px !important;
            right: 5vw !important;
          }
          
          .chatbot-icon {
            width: 60px !important;
            height: 60px !important;
          }
        }
      `}} />

      <div style={{ minHeight: '100vh', backgroundColor: '#FAF2E7' }}>
        {/* Header/Navigation */}
        <header className="fintech-header">
          <div className="fintech-logo-section">
            <svg className="fintech-logo" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="20" fill="#2AA46A"/>
              <path d="M20 8L28 16L20 24L12 16L20 8Z" fill="white"/>
              <path d="M20 16L24 20L20 24L16 20L20 16Z" fill="#F9A61B"/>
            </svg>
            <span className="fintech-brand">FinMate</span>
          </div>

          <div className="fintech-user-section">
            <EchoAuth />
          </div>
        </header>

        {/* Hero Section */}
        <section className="fintech-hero">
          <h1 className="fintech-welcome">
            Welcome to FinMate
          </h1>
          <p className="fintech-motto">
            Your AI-powered financial companion for navigating U.S. banking, taxes, and credit as an international student
          </p>
        </section>

        {/* Feature Cards */}
        <section className="fintech-cards-container">
          <div 
            className="fintech-card" 
            onClick={() => router.push('/banks')}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && router.push('/banks')}
          >
            <div className="fintech-card-icon">🏦</div>
            <h2 className="fintech-card-title">Bank Recommendations</h2>
            <p className="fintech-card-description">
              Find the perfect bank account for your situation. Get personalized recommendations based on your visa type and location.
            </p>
          </div>

          <div 
            className="fintech-card featured" 
            onClick={() => router.push('/remittance')}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && router.push('/remittance')}
          >
            <div className="fintech-card-icon">💸</div>
            <h2 className="fintech-card-title">Send Money Home</h2>
            <p className="fintech-card-description">
              Compare remittance services in real-time. Save hundreds on international transfers with AI-powered recommendations.
            </p>
            <span className="fintech-badge">NEW</span>
          </div>

          <div 
            className="fintech-card" 
            onClick={() => router.push('/receipt')}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && router.push('/receipt')}
          >
            <div className="fintech-card-icon">📄</div>
            <h2 className="fintech-card-title">Receipt Scanner</h2>
            <p className="fintech-card-description">
              Upload receipts to track payments and get AI-powered insights. Discover cheaper alternatives for your expenses.
            </p>
          </div>

          <div 
            className="fintech-card" 
            onClick={() => router.push('/transparency')}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && router.push('/transparency')}
          >
            <div className="fintech-card-icon">👁️</div>
            <h2 className="fintech-card-title">AI Transparency</h2>
            <p className="fintech-card-description">
              See exactly how our AI works. View traces, latency metrics, and understand every decision made by the system.
            </p>
          </div>
        </section>

        {/* Bottom Two-Column Section */}
        <section className="fintech-bottom-section">
          <div className="fintech-column">
            <h2 className="fintech-column-title">Why FinMate?</h2>
            <div className="fintech-column-content">
              <ul>
                <li>100% AI-powered financial guidance tailored for international students</li>
                <li>Real-time comparisons to save you money on every transaction</li>
                <li>Voice-enabled assistance in multiple languages</li>
                <li>Transparent AI decisions - see exactly how we help you</li>
                <li>Free forever - no hidden fees or subscriptions</li>
                <li>24/7 availability whenever you need financial advice</li>
              </ul>
            </div>
          </div>

          <div className="fintech-column">
            <h2 className="fintech-column-title">Contact Information</h2>
            <div className="fintech-column-content">
              <p><strong>Email:</strong> support@finmate.ai</p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              <p><strong>Address:</strong></p>
              <p>
                123 Innovation Drive<br />
                San Francisco, CA 94105<br />
                United States
              </p>
              <p style={{ marginTop: '1.5rem' }}>
                <strong>Hours:</strong><br />
                Monday - Friday: 9:00 AM - 6:00 PM PST<br />
                Weekend: AI Support Available 24/7
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          textAlign: 'center',
          padding: '2rem',
          marginTop: '3rem',
          color: '#6B7280',
          fontSize: '0.9rem',
          fontWeight: 500
        }}>
          <p>Built with AI for International Students</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Powered by Echo, ElevenLabs, and OpenAI
          </p>
        </footer>

        {/* Floating Chatbot Icon */}
        {!isChatOpen && (
          <div
            style={{
              position: 'fixed',
              bottom: '30px',
              right: '30px',
              zIndex: 1000
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Hover Tooltip */}
            <div
              style={{
                position: 'absolute',
                bottom: '75px',
                right: '0',
                backgroundColor: '#2A3140',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '12px',
                whiteSpace: 'nowrap',
                fontSize: '0.9rem',
                fontWeight: 500,
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? 'translateY(0)' : 'translateY(5px)',
                transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
                pointerEvents: 'none',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            >
              May I help you?
            </div>

            {/* Chat Icon Button */}
            <button
              onClick={handleChatOpen}
              className="chatbot-icon"
              style={{
                width: '65px',
                height: '65px',
                borderRadius: '50%',
                backgroundColor: '#2AA46A',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(42, 164, 106, 0.4)',
                transition: 'all 0.3s ease',
                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                animation: 'pulse 2s infinite'
              }}
              aria-label="Open chat"
            >
              {/* Message Icon SVG */}
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <circle cx="9" cy="10" r="1" fill="white" />
                <circle cx="12" cy="10" r="1" fill="white" />
                <circle cx="15" cy="10" r="1" fill="white" />
              </svg>
            </button>
          </div>
        )}

        {/* Chat Dialog */}
        {isChatOpen && (
          <div
            className="chatbot-dialog"
            style={{
              position: 'fixed',
              bottom: '30px',
              right: '30px',
              width: '380px',
              height: '550px',
              backgroundColor: 'white',
              borderRadius: '18px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
              zIndex: 999,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'slideUp 0.3s ease-out',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
            }}
          >
            {/* Dialog Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #2AA46A 0%, #1e8a54 100%)',
                color: 'white',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#4ade80',
                    boxShadow: '0 0 10px rgba(74, 222, 128, 0.6)',
                    animation: 'pulse 2s infinite'
                  }}
                />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                  AI Financial Mentor
                </h3>
              </div>
              <button
                onClick={handleChatClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                aria-label="Close chat"
              >
                ×
              </button>
            </div>

            {/* Message Area */}
            <div
              className="chat-messages"
              style={{
                flex: 1,
                padding: '1.5rem',
                overflowY: 'auto',
                backgroundColor: '#FAF2E7',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              {messages.length === 0 && (
                <div
                  style={{
                    backgroundColor: 'white',
                    padding: '1rem 1.25rem',
                    borderRadius: '15px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #EDECEA'
                  }}
                >
                  <p style={{ margin: 0, color: '#2A3140', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    👋 Hi there! I'm your AI Financial Mentor. Ask me anything about:
                  </p>
                  <ul style={{ marginTop: '0.75rem', marginBottom: 0, paddingLeft: '1.25rem', color: '#4B5563', fontSize: '0.9rem' }}>
                    <li>Banking without SSN</li>
                    <li>Money transfers and remittance</li>
                    <li>Receipt analysis</li>
                    <li>Credit building</li>
                    <li>Tax information</li>
                  </ul>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    backgroundColor: msg.role === 'user' ? '#2AA46A' : 'white',
                    color: msg.role === 'user' ? 'white' : '#2A3140',
                    padding: '0.875rem 1.125rem',
                    borderRadius: '15px',
                    maxWidth: '85%',
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    boxShadow: msg.role === 'assistant' ? '0 2px 8px rgba(0, 0, 0, 0.05)' : 'none',
                    border: msg.role === 'assistant' ? '1px solid #EDECEA' : 'none',
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {msg.content}
                </div>
              ))}

              {isLoading && (
                <div
                  style={{
                    backgroundColor: 'white',
                    padding: '0.875rem 1.125rem',
                    borderRadius: '15px',
                    maxWidth: '85%',
                    alignSelf: 'flex-start',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #EDECEA',
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2AA46A', animation: 'wave 1.4s infinite', animationDelay: '0s' }} />
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2AA46A', animation: 'wave 1.4s infinite', animationDelay: '0.2s' }} />
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2AA46A', animation: 'wave 1.4s infinite', animationDelay: '0.4s' }} />
                  </div>
                  <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>Thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form
              onSubmit={handleSubmit}
              style={{
                padding: '1.25rem 1.5rem',
                borderTop: '1px solid #EDECEA',
                backgroundColor: 'white',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center'
              }}
            >
              {/* Voice Input Button */}
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={isLoading}
                style={{
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: '12px',
                  backgroundColor: isRecording ? '#ef4444' : '#F9A61B',
                  color: 'white',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: isRecording ? 'recording 1.5s infinite' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) e.currentTarget.style.backgroundColor = isRecording ? '#dc2626' : '#e89510';
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) e.currentTarget.style.backgroundColor = isRecording ? '#ef4444' : '#F9A61B';
                }}
                aria-label={isRecording ? 'Stop listening' : 'Start voice input'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isRecording ? 'Listening...' : 'Type your message...'}
                disabled={isLoading || isRecording}
                style={{
                  flex: 1,
                  padding: '0.85rem 1rem',
                  border: '2px solid #EDECEA',
                  borderRadius: '15px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  backgroundColor: isRecording ? '#FEF3C7' : '#FAF2E7',
                  color: '#2A3140'
                }}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                style={{
                  backgroundColor: '#2AA46A',
                  border: 'none',
                  color: 'white',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '15px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer',
                  opacity: isLoading || !inputValue.trim() ? 0.5 : 1,
                  transition: 'all 0.2s',
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && inputValue.trim()) e.currentTarget.style.backgroundColor = '#1e8a54';
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && inputValue.trim()) e.currentTarget.style.backgroundColor = '#2AA46A';
                }}
              >
                Send
              </button>

              {/* Stop Speaking Button */}
              {isSpeaking && (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  style={{
                    padding: '0.75rem',
                    border: 'none',
                    borderRadius: '12px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                  aria-label="Stop speaking"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                </button>
              )}
            </form>
          </div>
        )}
      </div>
    </>
  );
}
