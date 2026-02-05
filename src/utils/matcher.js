// Matcher Module
(function (exports) {
    /**
     * Check if a keyword contains wildcard characters (* or ?)
     * @param {string} word 
     * @returns {boolean}
     */
    function isWildcardPattern(word) {
        return word.includes('*') || word.includes('?');
    }

    /**
     * Convert wildcard pattern to RegExp
     * * matches any characters, ? matches single character
     * @param {string} pattern 
     * @returns {RegExp}
     */
    function wildcardToRegex(pattern) {
        // Escape special regex chars except * and ?
        const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
        // Convert wildcards: * -> .*, ? -> .
        const regexPattern = escaped.replace(/\*/g, '.*').replace(/\?/g, '.');
        return new RegExp(regexPattern, 'i');
    }

    /**
     * Pure function to determine if text contains any of the keywords.
     * Supports both old format (string[]) and new format ({word, expiresAt}[])
     * Auto-detects wildcard patterns containing * or ?
     */
    exports.containsKeyword = function (text, keywords) {
        if (!text || !keywords || keywords.length === 0) {
            return false;
        }

        const lowerText = text.toLowerCase();

        return keywords.some(keyword => {
            // Support both string and object format
            const word = typeof keyword === 'string' ? keyword : keyword.word;
            if (!word) return false;

            // Auto-detect wildcard patterns
            if (isWildcardPattern(word)) {
                try {
                    return wildcardToRegex(word).test(text);
                } catch (e) {
                    // Fallback to substring match if regex fails
                    return lowerText.includes(word.toLowerCase());
                }
            }

            // Normal substring match (case-insensitive)
            return lowerText.includes(word.toLowerCase());
        });
    };

    /**
     * Validate a keyword input
     * @param {string} word 
     * @returns {{valid: boolean, error: string|null}}
     */
    exports.validateKeyword = function (word) {
        if (!word || word.trim() === '') {
            return { valid: false, error: '关键词不能为空' };
        }
        // Reject standalone wildcards
        if (word.trim() === '*' || word.trim() === '?') {
            return { valid: false, error: '单独的通配符会匹配所有内容，请输入更具体的模式' };
        }
        // Reject patterns that are essentially match-all
        if (/^\*+$/.test(word.trim()) || /^\?+$/.test(word.trim())) {
            return { valid: false, error: '此模式会匹配过多内容，请输入更具体的模式' };
        }
        return { valid: true, error: null };
    };

    /**
     * Check if a word is a wildcard pattern (for UI display)
     */
    exports.isWildcard = isWildcardPattern;
})(window.WebFilter_Matcher = window.WebFilter_Matcher || {});
