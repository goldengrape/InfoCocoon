// Main Content Script Orchestrator
(async function () {
    const Config = window.WebFilter_Config;
    const Matcher = window.WebFilter_Matcher;
    const Strategies = window.WebFilter_SiteStrategy;
    const Observer = window.WebFilter_Observer;
    const Hider = window.WebFilter_Hider;

    console.log('[WebFilter] Initializing...');

    // 1. Load Configuration
    const config = await Config.load();
    const hostname = window.location.hostname;

    // 2. Check if enabled for this site
    if (!Config.isSiteEnabled(config, hostname)) {
        console.log('[WebFilter] Disabled on this site:', hostname);
        return;
    }

    // 3. Get Strategy
    const strategy = Strategies.getStrategy(hostname);
    if (!strategy) {
        console.log('[WebFilter] No strategy found for:', hostname);
        // V1: Safe mode, do nothing if no strategy (or implement fallback later)
        return;
    }

    console.log('[WebFilter] Active strategy:', strategy);

    // Pre-filter keywords: global + site-specific for current hostname
    const activeKeywords = Config.getKeywordsForSite(config, hostname);
    console.log('[WebFilter] Active keywords for', hostname, ':', activeKeywords.length);

    const checkAndHide = (container) => {
        // Find text content
        let textContent = "";

        if (strategy.textSelector) {
            const textNode = container.querySelector(strategy.textSelector);
            if (textNode) {
                textContent = textNode.innerText;
            }
        } else {
            // Fallback: use container text
            textContent = container.innerText;
        }

        // Match against scoped keywords
        if (Matcher.containsKeyword(textContent, activeKeywords)) {
            Hider.hide(container);
        }
    };

    const processNodes = (nodes) => {
        nodes.forEach(node => {
            if (node instanceof Element) {
                // 1. Is the node itself a candidate?
                if (node.matches(strategy.containerSelector)) {
                    checkAndHide(node);
                }

                // 2. Search inside the node
                const candidates = node.querySelectorAll(strategy.containerSelector);
                candidates.forEach(candidate => checkAndHide(candidate));
            }
        });
    };

    // 4. Initial Scan
    processNodes([document.body]);

    // 5. Start Observer
    Observer.start((newNodes) => {
        processNodes(newNodes);
    });

    console.log('[WebFilter] Running.');

})();
