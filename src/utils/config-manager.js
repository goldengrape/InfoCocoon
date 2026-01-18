// ConfigManager Module
(function (exports) {
    const DEFAULT_CONFIG = {
        keywords: [],
        // Default sites (whitelist) - true means filtering is ENABLED
        siteRules: {
            "twitter.com": true,
            "x.com": true,
            "youtube.com": true,
            "bilibili.com": true
        }
    };

    /**
     * Loads configuration from storage.
     * @returns {Promise<Object>} The config object.
     */
    exports.load = function () {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['keywords', 'siteRules'], (items) => {
                const config = {
                    keywords: items.keywords || DEFAULT_CONFIG.keywords,
                    siteRules: { ...DEFAULT_CONFIG.siteRules, ...(items.siteRules || {}) }
                };
                resolve(config);
            });
        });
    };

    /**
     * Saves configuration to storage.
     * @param {Object} config 
     * @returns {Promise<void>}
     */
    exports.save = function (config) {
        return new Promise((resolve) => {
            chrome.storage.sync.set({
                keywords: config.keywords,
                siteRules: config.siteRules
            }, resolve);
        });
    };

    /**
     * Check if filtering should be enabled for a given hostname.
     * @param {Object} config 
     * @param {string} hostname 
     * @returns {boolean}
     */
    exports.isSiteEnabled = function (config, hostname) {
        // Simple domain matching (e.g., 'www.youtube.com' matches 'youtube.com')
        // We look for the base domain in the rules.
        const domain = Object.keys(config.siteRules).find(rule => hostname.includes(rule));
        if (domain) {
            return config.siteRules[domain];
        }
        return false; // Default closed for unknown sites per URD
    };

})(window.WebFilter_Config = window.WebFilter_Config || {});
