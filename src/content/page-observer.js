// Page Observer Module
(function (exports) {

    let observer = null;
    let debounceTimer = null;
    let pendingNodes = new Set();
    const DEBOUNCE_MS = 200;

    /**
     * Start observing the page for changes.
     * @param {Function} onNewNodes - Callback(Array<Node>)
     */
    exports.start = function (onNewNodes) {
        if (observer) observer.disconnect();

        observer = new MutationObserver((mutations) => {
            let hasNew = false;
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // ELEMENT_NODE
                        pendingNodes.add(node);
                        hasNew = true;
                    }
                });
            });

            if (hasNew) {
                scheduleProcessing(onNewNodes);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    };

    /**
     * Debounced processing trigger.
     */
    function scheduleProcessing(callback) {
        if (debounceTimer) clearTimeout(debounceTimer);

        debounceTimer = setTimeout(() => {
            // Convert Set to Array and clear
            const nodes = Array.from(pendingNodes);
            pendingNodes.clear();
            if (nodes.length > 0) {
                callback(nodes);
            }
        }, DEBOUNCE_MS);
    }

})(window.WebFilter_Observer = window.WebFilter_Observer || {});
