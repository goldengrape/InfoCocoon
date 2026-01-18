// Visual Hider Module
(function (exports) {

    /**
     * Hides the element visually without affecting layout flow (removes it from flow).
     * @param {HTMLElement} element 
     */
    exports.hide = function (element) {
        if (element && element.style) {
            // Check if already hidden to avoid style thrashing
            if (element.style.display !== 'none') {
                element.style.display = 'none';
                // Optional: add a data attribute to mark as processed by our filter
                element.setAttribute('data-web-filter-hidden', 'true');
                console.debug('[WebFilter] Hidden element', element);
            }
        }
    };

})(window.WebFilter_Hider = window.WebFilter_Hider || {});
