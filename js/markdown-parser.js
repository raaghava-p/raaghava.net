/**
 * Markdown Parser
 * Thin wrapper around marked that applies consistent configuration and sanitisation.
 */

(function () {
    if (!window.marked) {
        console.error('MarkdownParser: marked library is not available.');
        return;
    }

    // Configure marked defaults for consistent output
    window.marked.setOptions({
        gfm: true,
        breaks: false,
        mangle: false,
        headerIds: true
    });

    const DISALLOWED_TAGS = new Set(['script', 'iframe', 'object', 'embed', 'style']);
    const EVENT_ATTRIBUTE_REGEX = /^on/i;

    /**
     * Remove dangerous markup from generated HTML.
     * @param {string} html - Raw HTML string from the markdown renderer.
     * @returns {string} - Sanitised HTML string.
     */
    function sanitise(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        DISALLOWED_TAGS.forEach((tag) => {
            doc.querySelectorAll(tag).forEach((node) => node.remove());
        });

        doc.querySelectorAll('*').forEach((node) => {
            [...node.attributes].forEach((attr) => {
                const name = attr.name;
                const value = attr.value || '';
                if (EVENT_ATTRIBUTE_REGEX.test(name) || value.toLowerCase().includes('javascript:')) {
                    node.removeAttribute(name);
                }
            });
        });

        return doc.body.innerHTML;
    }

    const MarkdownParser = {
        /**
         * Convert markdown to sanitised HTML.
         * @param {string} markdown - Markdown source string.
         * @returns {string}
         */
        parse(markdown) {
            const html = window.marked.parse(markdown || '');
            return sanitise(html);
        }
    };

    window.MarkdownParser = MarkdownParser;
})();
