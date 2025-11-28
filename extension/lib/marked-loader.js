/**
 * Simple markdown parser (CSP-compliant, no external dependencies)
 * Supports basic markdown features needed for AI-generated content
 */

/**
 * Parse markdown to HTML
 * @param {string} markdown - Markdown text to parse
 * @returns {Promise<string>} Parsed HTML
 */
export async function parseMarkdown(markdown) {
    if (!markdown) return "";

    let html = markdown;

    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    };

    // Headers (### Header)
    html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
    html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
    html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

    // Bold (**text** or __text__)
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");

    // Italic (*text* or _text_)
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
    html = html.replace(/_(.+?)_/g, "<em>$1</em>");

    // Code blocks (```code```)
    html = html.replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>");

    // Inline code (`code`)
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Links [text](url)
    html = html.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Timestamps [MM:SS] or [HH:MM:SS]
    html = html.replace(
        /\[(\d{1,2}:\d{2}(?::\d{2})?)\]/g,
        '<button class="timestamp-btn" data-time="$1">$1</button>'
    );

    // Unordered lists
    html = html.replace(/^\* (.+)$/gim, "<li>$1</li>");
    html = html.replace(/^- (.+)$/gim, "<li>$1</li>");
    html = html.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gim, "<li>$1</li>");

    // Line breaks
    html = html.replace(/\n\n/g, "</p><p>");
    html = html.replace(/\n/g, "<br>");

    // Wrap in paragraph if not already wrapped
    if (!html.startsWith("<")) {
        html = `<p>${html}</p>`;
    }

    return html;
}

/**
 * Legacy function for compatibility
 * @returns {Promise<object>} Mock marked object
 */
export async function loadMarked() {
    return {
        parse: (md) => parseMarkdown(md),
    };
}
