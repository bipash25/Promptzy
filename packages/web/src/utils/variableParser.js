/**
 * Variable Parser Utility
 * Parse and extract {{variable}} placeholders from prompt content
 */

// Regex to match {{variable}} or {{variable:default}} or {{variable|type}}
const VARIABLE_REGEX = /\{\{([^}]+)\}\}/g;

/**
 * Parse a variable string to extract name, default value, and type
 * Supports formats:
 * - {{name}} - simple variable
 * - {{name:default value}} - with default
 * - {{name|type}} - with type hint (text, number, select, textarea)
 * - {{name:default|type}} - with both
 */
function parseVariable(variableString) {
    const trimmed = variableString.trim();

    let name = trimmed;
    let defaultValue = '';
    let type = 'text';
    let options = [];

    // Check for type hint (|type or |select:opt1,opt2,opt3)
    if (trimmed.includes('|')) {
        const [namePart, typePart] = trimmed.split('|');
        name = namePart.trim();

        if (typePart.startsWith('select:')) {
            type = 'select';
            options = typePart.replace('select:', '').split(',').map(o => o.trim());
        } else {
            type = typePart.trim();
        }
    }

    // Check for default value (:default)
    if (name.includes(':')) {
        const [namePart, defaultPart] = name.split(':');
        name = namePart.trim();
        defaultValue = defaultPart.trim();
    }

    return {
        name,
        defaultValue,
        type,
        options,
        original: `{{${variableString}}}`,
    };
}

/**
 * Extract all variables from content
 * @param {string} content - The prompt content
 * @returns {Array} Array of variable objects
 */
export function extractVariables(content) {
    if (!content) return [];

    const matches = content.matchAll(VARIABLE_REGEX);
    const variablesMap = new Map();

    for (const match of matches) {
        const parsed = parseVariable(match[1]);
        // Use name as key to deduplicate
        if (!variablesMap.has(parsed.name)) {
            variablesMap.set(parsed.name, parsed);
        }
    }

    return Array.from(variablesMap.values());
}

/**
 * Check if content has any variables
 * @param {string} content - The prompt content
 * @returns {boolean}
 */
export function hasVariables(content) {
    if (!content) return false;
    return VARIABLE_REGEX.test(content);
}

/**
 * Fill variables in content with provided values
 * @param {string} content - The prompt content
 * @param {Object} values - Object with variable name -> value mapping
 * @returns {string} Content with variables replaced
 */
export function fillVariables(content, values) {
    if (!content) return '';

    return content.replace(VARIABLE_REGEX, (match, variableString) => {
        const parsed = parseVariable(variableString);
        return values[parsed.name] ?? parsed.defaultValue ?? match;
    });
}

/**
 * Get variable count in content
 * @param {string} content - The prompt content
 * @returns {number}
 */
export function getVariableCount(content) {
    return extractVariables(content).length;
}

/**
 * Highlight variables in content for display
 * Returns content with variable spans wrapped in markers
 * @param {string} content - The prompt content
 * @returns {string} Content with markers for highlighting
 */
export function highlightVariables(content) {
    if (!content) return '';

    return content.replace(VARIABLE_REGEX, (match) => {
        return `<var>${match}</var>`;
    });
}

export default {
    extractVariables,
    hasVariables,
    fillVariables,
    getVariableCount,
    highlightVariables,
};
