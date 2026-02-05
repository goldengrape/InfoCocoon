// Matcher Module
(function (exports) {
    /**
     * Pure function to determine if text contains any of the keywords.
     * Supports both old format (string[]) and new format ({word, expiresAt}[])
     */
    exports.containsKeyword = function (text, keywords) {
        if (!text || !keywords || keywords.length === 0) {
            return false;
        }

        const lowerText = text.toLowerCase();

        // Case-insensitive substring match
        return keywords.some(keyword => {
            // Support both string and object format
            const word = typeof keyword === 'string' ? keyword : keyword.word;
            if (!word) return false;
            return lowerText.includes(word.toLowerCase());
        });
    };
})(window.WebFilter_Matcher = window.WebFilter_Matcher || {});
