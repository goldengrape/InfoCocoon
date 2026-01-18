// Site Strategies Module
(function (exports) {

    // Strategies for supported sites
    const STRATEGIES = [
        {
            // Twitter / X
            hostPattern: /(twitter\.com|x\.com)/,
            containerSelector: 'article',
            textSelector: 'div[data-testid="tweetText"]'
        },
        {
            // YouTube
            hostPattern: /youtube\.com/,
            // Covers Homepage grid and Search results list
            containerSelector: 'ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer',
            textSelector: '#video-title'
        },
        {
            // Bilibili
            hostPattern: /bilibili\.com/,
            // New and Old feed layouts (approximate)
            containerSelector: '.bili-video-card, .feed-card, .bili-dyn-list__item',
            textSelector: '.bili-video-card__info--tit, .bili-video-card__info--author, .bili-dyn-content__orig__text'
        }
    ];

    /**
     * Get the strategy for the current hostname.
     * @param {string} hostname 
     * @returns {Object|null}
     */
    exports.getStrategy = function (hostname) {
        return STRATEGIES.find(s => s.hostPattern.test(hostname)) || null;
    };

})(window.WebFilter_SiteStrategy = window.WebFilter_SiteStrategy || {});
