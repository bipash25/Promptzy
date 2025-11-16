// Markdown utilities for rendering and parsing

export const markdownUtils = {
  // Parse template variables from content
  parseVariables(content) {
    const regex = /\{\{([^}]+)\}\}/g;
    const variables = new Set();
    let match;

    while ((match = regex.exec(content)) !== null) {
      variables.add(match[1].trim());
    }

    return Array.from(variables);
  },

  // Replace template variables with values
  replaceVariables(content, values) {
    let result = content;
    
    Object.entries(values).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      result = result.replace(regex, value);
    });

    return result;
  },

  // Count words in text
  countWords(text) {
    if (!text) return 0;
    const words = text.trim().split(/\s+/);
    return words.filter(word => word.length > 0).length;
  },

  // Count characters (excluding markdown syntax)
  countCharacters(text, excludeSpaces = false) {
    if (!text) return 0;
    let cleaned = text;
    
    // Remove markdown syntax for more accurate count
    cleaned = cleaned.replace(/[#*_~`\[\]()]/g, '');
    
    if (excludeSpaces) {
      cleaned = cleaned.replace(/\s/g, '');
    }
    
    return cleaned.length;
  },

  // Estimate token count (rough approximation: 1 token ≈ 4 characters)
  estimateTokens(text) {
    if (!text) return 0;
    const chars = text.length;
    return Math.ceil(chars / 4);
  },

  // Simple markdown to HTML converter
  toHTML(markdown) {
    if (!markdown) return '';

    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // Code inline
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]+?)```/g, '<pre><code class="language-$1">$2</code></pre>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Lists
    html = html.replace(/^\* (.+)$/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>');

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');

    // Wrap in paragraphs
    html = `<p>${html}</p>`;

    // Highlight template variables
    html = html.replace(/\{\{([^}]+)\}\}/g, '<span class="template-var">{{$1}}</span>');

    return html;
  },

  // Extract plain text from markdown
  toPlainText(markdown) {
    if (!markdown) return '';

    let text = markdown;

    // Remove code blocks
    text = text.replace(/```[\s\S]*?```/g, '');

    // Remove inline code
    text = text.replace(/`[^`]*`/g, '');

    // Remove links but keep text
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // Remove images
    text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');

    // Remove headers
    text = text.replace(/^#+\s+/gm, '');

    // Remove bold/italic
    text = text.replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1');

    // Remove horizontal rules
    text = text.replace(/^[-*_]{3,}$/gm, '');

    // Clean up extra whitespace
    text = text.replace(/\n{3,}/g, '\n\n');
    text = text.trim();

    return text;
  },

  // Get markdown statistics
  getStats(markdown) {
    const plainText = this.toPlainText(markdown);
    
    return {
      words: this.countWords(plainText),
      characters: plainText.length,
      charactersNoSpaces: this.countCharacters(plainText, true),
      tokens: this.estimateTokens(plainText),
      lines: markdown.split('\n').length,
      paragraphs: markdown.split(/\n\n+/).filter(p => p.trim()).length,
      variables: this.parseVariables(markdown),
    };
  },

  // Validate markdown syntax
  validate(markdown) {
    const errors = [];

    // Check for unclosed code blocks
    const codeBlocks = markdown.match(/```/g);
    if (codeBlocks && codeBlocks.length % 2 !== 0) {
      errors.push('Unclosed code block');
    }

    // Check for unclosed inline code
    const inlineCode = markdown.match(/`/g);
    if (inlineCode && inlineCode.length % 2 !== 0) {
      errors.push('Unclosed inline code');
    }

    // Check for malformed links
    const links = markdown.match(/\[([^\]]*)\]\(([^)]*)\)/g);
    if (links) {
      links.forEach(link => {
        if (!link.includes('](')) {
          errors.push(`Malformed link: ${link}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  // Format markdown (basic formatting)
  format(markdown) {
    let formatted = markdown;

    // Ensure headers have blank line before/after
    formatted = formatted.replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2');
    formatted = formatted.replace(/(#{1,6}\s.+)\n([^\n])/g, '$1\n\n$2');

    // Ensure lists have blank line before
    formatted = formatted.replace(/([^\n])\n([*-]\s)/g, '$1\n\n$2');

    // Clean up multiple blank lines
    formatted = formatted.replace(/\n{3,}/g, '\n\n');

    return formatted.trim();
  },
};

export default markdownUtils;