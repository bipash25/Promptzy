/**
 * Token Counter Utility
 * Estimates token counts for different LLM models
 * 
 * Token estimation ratios (approximate):
 * - GPT-4/GPT-3.5: ~4 characters per token
 * - Claude: ~3.5 characters per token  
 * - Gemini: ~4 characters per token
 */

/**
 * Estimate tokens for GPT-4/GPT-3.5
 * @param {string} text - Input text
 * @returns {number} Estimated token count
 */
export function estimateGPT4Tokens(text) {
    if (!text) return 0;
    // GPT tokenizer is roughly 4 chars per token for English
    // Account for whitespace and special characters
    const words = text.trim().split(/\s+/).filter(Boolean);
    const chars = text.length;
    // Blend word-based and char-based estimation
    return Math.ceil((words.length * 1.3 + chars / 4) / 2);
}

/**
 * Estimate tokens for Claude
 * @param {string} text - Input text
 * @returns {number} Estimated token count
 */
export function estimateClaudeTokens(text) {
    if (!text) return 0;
    // Claude uses a slightly more efficient tokenizer
    const words = text.trim().split(/\s+/).filter(Boolean);
    const chars = text.length;
    return Math.ceil((words.length * 1.2 + chars / 3.5) / 2);
}

/**
 * Estimate tokens for Gemini
 * @param {string} text - Input text
 * @returns {number} Estimated token count
 */
export function estimateGeminiTokens(text) {
    if (!text) return 0;
    // Gemini tokenization is similar to GPT
    const words = text.trim().split(/\s+/).filter(Boolean);
    const chars = text.length;
    return Math.ceil((words.length * 1.3 + chars / 4) / 2);
}

/**
 * Get all token estimates for a text
 * @param {string} text - Input text
 * @returns {object} Token estimates for all models
 */
export function getAllTokenEstimates(text) {
    return {
        gpt4: estimateGPT4Tokens(text),
        claude: estimateClaudeTokens(text),
        gemini: estimateGeminiTokens(text),
    };
}

/**
 * Format token count for display
 * @param {number} count - Token count
 * @returns {string} Formatted string (e.g., "1.2k")
 */
export function formatTokenCount(count) {
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
}

export default {
    estimateGPT4Tokens,
    estimateClaudeTokens,
    estimateGeminiTokens,
    getAllTokenEstimates,
    formatTokenCount,
};
