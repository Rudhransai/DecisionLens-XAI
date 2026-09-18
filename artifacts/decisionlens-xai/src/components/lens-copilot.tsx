import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  MessageSquare,
  Copy,
  Check,
  ChevronDown,
  ShieldAlert,
  FileText,
  Lightbulb,
} from 'lucide-react';
import type { DecisionAnalysis } from '@workspace/api-client-react';

interface LensCopilotProps {
  decision: DecisionAnalysis;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export function LensCopilot({ decision, isOpen, onClose }: LensCopilotProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message when opened
  useEffect(() => {
    if (messages.length === 0 && decision) {
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: `👋 Hello! I am **Lens AI**, your explainability copilot for **"${decision.scenarioName}"**.\n\nCurrent status: **${decision.recommendationLabel.toUpperCase()}** (${decision.overallScore}/100 readiness, ${decision.confidence}% confidence).\n\nAsk me anything about factor attributions, risk mitigations, or request an executive memo!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [decision]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const generateAIResponse = (query: string): string => {
    const q = query.toLowerCase();
    const topNegativeFactors = [...decision.factors]
      .filter((f) => f.impact < 0 || f.score < 60 || f.key === 'riskExposure')
      .sort((a, b) => a.impact - b.impact);

    const topPositiveFactors = [...decision.factors]
      .filter((f) => f.impact > 0)
      .sort((a, b) => b.impact - a.impact);

    if (q.includes('why') || q.includes('reason') || q.includes('guardrail') || q.includes('rework') || q.includes('score')) {
      const blockers = topNegativeFactors
        .map((f) => `• **${f.label} (${f.score}/100)**: Dragging score by ${Math.abs(f.impact)} pts. ${f.explanation}`)
        .join('\n');

      return `### 🔍 Score & Recommendation Decomposition\n\nOverall readiness is evaluated at **${decision.overallScore}/100** with **${decision.confidence}%** confidence (${decision.confidenceLabel}).\n\n**Primary Drag Factors:**\n${blockers || '• No major blockers identified.'}\n\n**Strategic Rationale:**\n${decision.rationale}`;
    }

    if (q.includes('memo') || q.includes('brief') || q.includes('executive') || q.includes('board')) {
      return `### 📋 C-Level Executive Briefing Memo\n\n**TO:** Executive Leadership & Risk Committee  \n**FROM:** DecisionLens XAI Intelligence Room  \n**DATE:** ${new Date(decision.createdAt).toLocaleDateString()}  \n**SUBJECT:** Operational Readiness Assessment — ${decision.scenarioName}  \n\n**1. EXECUTIVE VERDICT:**  \nThe algorithmic consensus is **${decision.recommendationLabel.toUpperCase()}** with an overall readiness score of **${decision.overallScore}/100**.\n\n**2. KEY VALUE DRIVERS:**  \n${topPositiveFactors.map((f) => `- *${f.label}* (+${f.impact} pts attribution): ${f.explanation}`).join('\n')}\n\n**3. CRITICAL RISK EXPOSURES:**  \n${topNegativeFactors.map((f) => `- *${f.label}* (${f.score}/100): Requires active operational guardrails prior to deployment.`).join('\n')}\n\n**4. RECOMMENDED NEXT STEPS:**  \n${decision.nextSteps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}`;
    }

    if (q.includes('fast') || q.includes('proceed') || q.includes('how to reach') || q.includes('improve')) {
      return `### ⚡ Fastest Path to "PROCEED" (Score $\\ge 75$)\n\nTo bridge the gap from **${decision.overallScore}** to **$\ge 75$**, focus exclusively on these high-ROI levers:\n\n1. **${topNegativeFactors[0]?.label || 'Strategic Alignment'}**: Boost from ${topNegativeFactors[0]?.score || 50} to $\ge 80$. Estimated score lift: **+${Math.abs(Math.round((topNegativeFactors[0]?.impact || -5) * 1.8))} pts**.\n2. **De-risk Execution**: Implement canary testing or staging milestones to compress Risk Exposure down by 15 points.\n3. **Leverage Strengths**: ${topPositiveFactors[0]?.label || 'Financial Readiness'} is currently your strongest pillar (+${topPositiveFactors[0]?.impact || 8} pts). Keep this baseline intact.`;
    }

    if (q.includes('worst') || q.includes('stress') || q.includes('risk') || q.includes('deteriorate')) {
      const stressedScore = Math.max(20, decision.overallScore - 22);
      return `### ⚠️ Stress-Test & Adverse Condition Analysis\n\n**Simulated Adverse Scenario:** Market Evidence drops -25%, Timeline Pressure surges +30%.\n\n- **Projected Stressed Score:** **${stressedScore}/100** (REWORK BEFORE COMMITTING)\n- **Vulnerability Index:** High sensitivity to timeline compression.\n- **Mitigation:** Establish an automated rollback plan and secure flexible quarterly milestone buffers before commit.`;
    }

    // Default intelligent synthesized answer
    return `### 🤖 Lens AI Analysis for "${decision.scenarioName}"\n\nBased on the 7-dimensional explainability model:\n\n- **Current Score:** ${decision.overallScore}/100 (${decision.recommendationLabel})\n- **Confidence:** ${decision.confidence}% (${decision.confidenceLabel})\n- **Top Driver:** ${topPositiveFactors[0]?.label || 'Strategic Alignment'} (+${topPositiveFactors[0]?.impact || 5} pts)\n- **Primary Blocker:** ${topNegativeFactors[0]?.label || 'Risk Exposure'} (${topNegativeFactors[0]?.score || 40}/100)\n\n💡 **Action Item:** ${decision.nextSteps[0] || 'Conduct preliminary risk assessment with stakeholders.'}`;
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = generateAIResponse(text);
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '420px',
        maxWidth: '100vw',
        height: '100vh',
        backgroundColor: '#ffffff',
        boxShadow: '-8px 0 32px rgba(15, 23, 42, 0.15)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid #d9e6e1',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #0d3b33 0%, #164e44 100%)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              background: '#2dd4bf',
              color: '#0d3b33',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
            }}
          >
            <Bot size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>
              Ask Lens AI Copilot
            </h3>
            <div style={{ fontSize: '11px', color: '#a7f3d0', marginTop: '2px' }}>
              Explainability Intelligence &amp; Executive Memo Synthesizer
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#a7f3d0',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div style={{ padding: '10px 16px', background: '#f4fbf8', borderBottom: '1px solid #e2ece7' }}>
        <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#5f7b73', fontWeight: 700, marginBottom: '6px' }}>
          Suggested Inquiries
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { label: '🔍 Explain Blockers', query: 'Why is this score below Proceed?' },
            { label: '⚡ Fastest Path to Proceed', query: 'What is the fastest way to reach PROCEED?' },
            { label: '📝 Executive Memo', query: 'Generate an executive briefing memo for the board' },
            { label: '⚠️ Stress Test', query: 'What if market conditions deteriorate by 25%?' },
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt.query)}
              style={{
                fontSize: '11px',
                padding: '4px 8px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1px solid #cbdcd5',
                color: '#164e44',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              {prompt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Message List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          background: '#fafcfb',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '90%',
            }}
          >
            <div
              style={{
                padding: '10px 14px',
                borderRadius: msg.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                background: msg.sender === 'user' ? 'var(--dl-teal)' : '#ffffff',
                color: msg.sender === 'user' ? '#ffffff' : '#1e293b',
                border: msg.sender === 'user' ? 'none' : '1px solid #e2ece7',
                fontSize: '12px',
                lineHeight: 1.5,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                whiteSpace: 'pre-line',
              }}
            >
              {msg.text}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'space-between',
                fontSize: '10px',
                color: '#94a3b8',
                marginTop: '4px',
                padding: '0 4px',
              }}
            >
              <span>{msg.timestamp}</span>
              {msg.sender === 'assistant' && (
                <button
                  onClick={() => handleCopy(msg.id, msg.text)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  {copiedId === msg.id ? <Check size={11} color="#16a34a" /> : <Copy size={11} />}
                  {copiedId === msg.id ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '11px', padding: '8px' }}>
            <Sparkles size={13} className="animate-spin" color="var(--dl-teal)" />
            Lens AI is synthesizing decision signals...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #e2ece7',
          background: '#ffffff',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="Ask Lens AI about this decision..."
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #cbdcd5',
            fontSize: '12px',
            outline: 'none',
          }}
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim()}
          style={{
            background: input.trim() ? 'var(--dl-teal)' : '#cbdcd5',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 12px',
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
