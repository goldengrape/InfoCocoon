// ConfigManager Module
(function (exports) {
    const DEFAULT_CONFIG = {
        keywords: [],  // [{word: string, expiresAt: number|null, scope?: string|null}]
        // Default sites (whitelist) - true means filtering is ENABLED
        siteRules: {
            "twitter.com": true,
            "x.com": true,
            "youtube.com": true,
            "bilibili.com": true
        }
    };

    /**
     * Migrate old keyword format (string[]) to new format ({word, expiresAt}[])
     * @param {Array} keywords 
     * @returns {Array} Migrated keywords
     */
    function migrateKeywords(keywords) {
        if (!keywords || keywords.length === 0) {
            return [];
        }
        return keywords.map(kw => {
            if (typeof kw === 'string') {
                return { word: kw, expiresAt: null };
            }
            return kw;
        });
    }

    /**
     * Remove expired keywords from the list
     * @param {Array} keywords 
     * @returns {Array} Cleaned keywords
     */
    function cleanExpiredKeywords(keywords) {
        const now = Date.now();
        return keywords.filter(kw => {
            if (kw.expiresAt === null) return true;
            return kw.expiresAt > now;
        });
    }

    /**
     * Loads configuration from storage.
     * Automatically migrates old format and cleans expired keywords.
     * @returns {Promise<Object>} The config object.
     */
    exports.load = function () {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['keywords', 'siteRules'], (items) => {
                let keywords = migrateKeywords(items.keywords || DEFAULT_CONFIG.keywords);
                keywords = cleanExpiredKeywords(keywords);

                const config = {
                    keywords: keywords,
                    siteRules: { ...DEFAULT_CONFIG.siteRules, ...(items.siteRules || {}) }
                };

                // Save back if we cleaned any expired keywords
                if (items.keywords && items.keywords.length !== keywords.length) {
                    exports.save(config);
                }

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
        const domain = Object.keys(config.siteRules).find(rule => hostname.includes(rule));
        if (domain) {
            return config.siteRules[domain];
        }
        return false;
    };

    /**
     * Add a keyword with optional expiration and scope
     * @param {Object} config 
     * @param {string} word 
     * @param {number|null} expiresInDays - null for permanent, number for days
     * @param {string|null} [scope=null] - null for global, domain string for site-specific
     * @returns {boolean} True if added, false if duplicate
     */
    exports.addKeyword = function (config, word, expiresInDays, scope) {
        scope = scope || null;
        const exists = config.keywords.some(kw => kw.word === word && (kw.scope || null) === scope);
        if (exists) return false;

        const expiresAt = expiresInDays === null
            ? null
            : Date.now() + (expiresInDays * 24 * 60 * 60 * 1000);

        const keyword = { word, expiresAt };
        if (scope) keyword.scope = scope;
        config.keywords.push(keyword);
        return true;
    };

    /**
     * Remove a keyword by word and scope
     * @param {Object} config 
     * @param {string} word 
     * @param {string|null} [scope=null] - null for global, domain string for site-specific
     */
    exports.removeKeyword = function (config, word, scope) {
        scope = scope || null;
        config.keywords = config.keywords.filter(kw => !(kw.word === word && (kw.scope || null) === scope));
    };

    /**
     * Export keywords to JSON string
     * @param {Object} config 
     * @returns {string} JSON string of keywords
     */
    exports.exportKeywords = function (config) {
        return JSON.stringify({
            version: 3,
            exportedAt: new Date().toISOString(),
            keywords: config.keywords
        }, null, 2);
    };

    /**
     * Import keywords from JSON string
     * @param {Object} config 
     * @param {string} jsonString 
     * @returns {{added: number, skipped: number}} Import result
     */
    exports.importKeywords = function (config, jsonString) {
        const data = JSON.parse(jsonString);
        let added = 0, skipped = 0;

        const keywordsToImport = data.keywords || data;  // Support plain array too

        keywordsToImport.forEach(kw => {
            const word = typeof kw === 'string' ? kw : kw.word;
            const expiresAt = typeof kw === 'string' ? null : kw.expiresAt;
            const scope = (typeof kw === 'string' ? null : kw.scope) || null;

            const exists = config.keywords.some(k => k.word === word && (k.scope || null) === scope);
            if (!exists) {
                const keyword = { word, expiresAt };
                if (scope) keyword.scope = scope;
                config.keywords.push(keyword);
                added++;
            } else {
                skipped++;
            }
        });

        return { added, skipped };
    };

    /**
     * Get active keyword words only (for matching)
     * @param {Object} config 
     * @param {string} [hostname] - optional hostname to filter by scope
     * @returns {string[]} Array of keyword strings
     */
    exports.getActiveKeywordWords = function (config, hostname) {
        return exports.getKeywordsForSite(config, hostname).map(kw => kw.word);
    };

    /**
     * Get keyword objects applicable for a given site.
     * Returns global keywords + keywords scoped to the matching domain.
     * @param {Object} config 
     * @param {string} [hostname] - optional hostname; if omitted returns all keywords
     * @returns {Array} Array of keyword objects
     */
    exports.getKeywordsForSite = function (config, hostname) {
        if (!hostname) return config.keywords;
        return config.keywords.filter(kw => {
            const scope = kw.scope || null;
            if (scope === null) return true;  // global keyword
            return hostname.includes(scope);  // site-specific match
        });
    };

})(window.WebFilter_Config = window.WebFilter_Config || {});
