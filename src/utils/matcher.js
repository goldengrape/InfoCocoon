// Matcher Module
(function (exports) {
    /**
     * Pure function to determine if text contains any of the keywords.
     */
    exports.containsKeyword = function (text, keywords) {
        if (!text || !keywords || keywords.length === 0) {
            return false;
        }

        const lowerText = text.toLowerCase();

        // Case-insensitive substring match
        return keywords.some(keyword => {
            if (!keyword) return false;
            return lowerText.includes(keyword.toLowerCase());
        });
    };
})(window.WebFilter_Matcher = window.WebFilter_Matcher || {});

