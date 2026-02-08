import React from 'react';
import './MarkdownRenderer.css';

const MarkdownRenderer = ({ content }) => {
  if (!content) return null;

  const parseMarkdown = (text) => {
    const lines = text.split('\n');
    const elements = [];
    let currentList = [];
    let currentCodeBlock = null;
    let codeLanguage = '';

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="md-list">
            {currentList.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    const flushCodeBlock = () => {
      if (currentCodeBlock !== null) {
        elements.push(
          <div key={`code-${elements.length}`} className="md-code-block">
            {codeLanguage && <div className="md-code-lang">{codeLanguage}</div>}
            <pre><code>{currentCodeBlock}</code></pre>
          </div>
        );
        currentCodeBlock = null;
        codeLanguage = '';
      }
    };

    lines.forEach((line, index) => {
      // Code block start/end
      if (line.trim().startsWith('```')) {
        if (currentCodeBlock === null) {
          flushList();
          codeLanguage = line.trim().slice(3).trim();
          currentCodeBlock = '';
        } else {
          flushCodeBlock();
        }
        return;
      }

      // Inside code block
      if (currentCodeBlock !== null) {
        currentCodeBlock += line + '\n';
        return;
      }

      // Headings
      if (line.startsWith('### ')) {
        flushList();
        elements.push(<h3 key={index} className="md-h3" dangerouslySetInnerHTML={{ __html: parseInline(line.slice(4)) }} />);
      } else if (line.startsWith('## ')) {
        flushList();
        elements.push(<h2 key={index} className="md-h2" dangerouslySetInnerHTML={{ __html: parseInline(line.slice(3)) }} />);
      } else if (line.startsWith('# ')) {
        flushList();
        elements.push(<h1 key={index} className="md-h1" dangerouslySetInnerHTML={{ __html: parseInline(line.slice(2)) }} />);
      }
      // Lists
      else if (line.trim().match(/^[-*•]\s/)) {
        currentList.push(line.trim().slice(2));
      } else if (line.trim().match(/^\d+\.\s/)) {
        currentList.push(line.trim().replace(/^\d+\.\s/, ''));
      }
      // Horizontal rule
      else if (line.trim().match(/^[-*_]{3,}$/)) {
        flushList();
        elements.push(<hr key={index} className="md-hr" />);
      }
      // Paragraph
      else if (line.trim()) {
        flushList();
        elements.push(<p key={index} className="md-p" dangerouslySetInnerHTML={{ __html: parseInline(line) }} />);
      }
      // Empty line
      else {
        flushList();
      }
    });

    flushList();
    flushCodeBlock();

    return elements;
  };

  const parseInline = (text) => {
    return text
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      // Inline code
      .replace(/`(.+?)`/g, '<code class="md-inline-code">$1</code>')
      // Links
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>');
  };

  return <div className="markdown-renderer">{parseMarkdown(content)}</div>;
};

export default MarkdownRenderer;
