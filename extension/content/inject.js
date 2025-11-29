/**
 * Interceptor Injector
 * Runs at document_start to inject the XHR/Fetch interceptor immediately
 */
(function () {
    try {
        const script = document.createElement("script");
        script.src = chrome.runtime.getURL(
            "content/transcript/xhr-interceptor.js"
        );
        script.type = "module"; // Important for ES modules

        // Inject immediately into the document
        (document.head || document.documentElement).appendChild(script);

        // Clean up script tag after injection (optional, but cleaner)
        script.onload = function () {
            this.remove();
        };

        console.log("[YouTube AI Master] Interceptor injected");
    } catch (e) {
        console.error("[YouTube AI Master] Failed to inject interceptor:", e);
    }
})();
