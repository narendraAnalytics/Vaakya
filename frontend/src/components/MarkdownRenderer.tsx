'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import type { Components } from 'react-markdown'

interface MarkdownRendererProps {
  content: string
  maxHeight?: number
}

const HEADING_FONT = 'Georgia, "Times New Roman", serif'
const BODY_FONT = '"Plus Jakarta Sans", sans-serif'
const GREEN = '#1A5C35'
const ACCENT = '#1EA851'
const DARK = '#0F2D1F'
const MID = '#4A6858'
const FAINT = '#7B9A8A'

const components: Components = {
  h1: ({ children }) => (
    <h1 style={{
      fontFamily: HEADING_FONT,
      fontSize: 22,
      fontWeight: 700,
      color: DARK,
      borderBottom: `2px solid ${ACCENT}`,
      paddingBottom: 8,
      marginTop: 28,
      marginBottom: 14,
      letterSpacing: -0.3,
      lineHeight: 1.3,
    }}>{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 style={{
      fontFamily: HEADING_FONT,
      fontSize: 17,
      fontWeight: 700,
      color: GREEN,
      marginTop: 24,
      marginBottom: 10,
      letterSpacing: -0.2,
      lineHeight: 1.35,
    }}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 style={{
      fontFamily: BODY_FONT,
      fontSize: 14,
      fontWeight: 700,
      color: DARK,
      marginTop: 18,
      marginBottom: 7,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    }}>{children}</h3>
  ),
  p: ({ children }) => (
    <p style={{
      fontFamily: BODY_FONT,
      fontSize: 13.5,
      color: MID,
      lineHeight: 1.85,
      marginBottom: 12,
    }}>{children}</p>
  ),
  strong: ({ children }) => (
    <strong style={{ fontWeight: 700, color: DARK }}>{children}</strong>
  ),
  em: ({ children }) => (
    <em style={{ fontStyle: 'italic', color: MID }}>{children}</em>
  ),
  ul: ({ children }) => (
    <ul style={{
      marginLeft: 20,
      marginBottom: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 5,
      listStyle: 'none',
      padding: 0,
    }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{
      marginLeft: 20,
      marginBottom: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 5,
      paddingLeft: 16,
    }}>{children}</ol>
  ),
  li: ({ children }) => (
    <li style={{
      fontFamily: BODY_FONT,
      fontSize: 13.5,
      color: MID,
      lineHeight: 1.75,
      paddingLeft: 8,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 8,
    }}>
      <span style={{ color: ACCENT, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>›</span>
      <span>{children}</span>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote style={{
      borderLeft: `3px solid ${ACCENT}`,
      margin: '14px 0',
      padding: '10px 16px',
      background: '#F0FBF4',
      borderRadius: '0 10px 10px 0',
    }}>
      <div style={{ fontFamily: BODY_FONT, fontSize: 13, color: GREEN, fontStyle: 'italic', lineHeight: 1.7 }}>
        {children}
      </div>
    </blockquote>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.startsWith('language-')
    if (isBlock) {
      return (
        <pre style={{
          background: '#1A2E22',
          borderRadius: 10,
          padding: '14px 16px',
          overflowX: 'auto',
          margin: '14px 0',
        }}>
          <code style={{
            fontFamily: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
            fontSize: 12.5,
            color: '#A8D5B5',
            lineHeight: 1.7,
          }}>{children}</code>
        </pre>
      )
    }
    return (
      <code style={{
        fontFamily: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
        fontSize: 12.5,
        background: '#E0F5E8',
        color: GREEN,
        padding: '2px 6px',
        borderRadius: 5,
        fontWeight: 600,
      }}>{children}</code>
    )
  },
  pre: ({ children }) => <>{children}</>,
  hr: () => (
    <hr style={{
      border: 'none',
      borderTop: `1.5px solid rgba(30,168,81,0.15)`,
      margin: '20px 0',
    }} />
  ),
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', margin: '16px 0', borderRadius: 10, border: '1px solid rgba(26,92,53,0.12)' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: BODY_FONT,
        fontSize: 13,
      }}>{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead style={{ background: '#E8F5EE' }}>{children}</thead>
  ),
  th: ({ children }) => (
    <th style={{
      padding: '10px 14px',
      textAlign: 'left',
      fontWeight: 700,
      color: GREEN,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      borderBottom: `2px solid rgba(26,92,53,0.15)`,
    }}>{children}</th>
  ),
  td: ({ children }) => (
    <td style={{
      padding: '9px 14px',
      color: MID,
      lineHeight: 1.6,
      borderBottom: '1px solid rgba(26,92,53,0.07)',
    }}>{children}</td>
  ),
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{
      color: ACCENT,
      textDecoration: 'underline',
      textDecorationColor: 'rgba(30,168,81,0.4)',
      fontWeight: 600,
    }}>{children}</a>
  ),
}

export default function MarkdownRenderer({ content, maxHeight }: MarkdownRendererProps) {
  return (
    <div style={{
      fontFamily: BODY_FONT,
      color: DARK,
      maxHeight: maxHeight,
      overflowY: maxHeight ? 'auto' : undefined,
      scrollbarWidth: 'thin',
      scrollbarColor: 'rgba(26,92,53,0.18) transparent',
    }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
