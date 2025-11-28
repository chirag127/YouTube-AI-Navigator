import { findSecondaryColumn } from "../utils/dom.js";
import { initTabs } from "./tabs.js";
import { attachEventListeners } from "../handlers/events.js";
import { log, logError, waitForElement } from "../core/debug.js";
import { createWidgetHTML } from "./components/widget/structure.js";

let widgetContainer = null;
let resizeObserver = null;

function updateWidgetHeight() {
    if (!widgetContainer) return;

    const player =
        document.querySelector("#movie_player") ||
        document.querySelector(".html5-video-player");
    if (player) {
        const height = player.offsetHeight;
        if (height > 0) {
            widgetContainer.style.maxHeight = `${height}px`;
            widgetContainer.style.height = `${height}px`;
        }
    }
}

export async function injectWidget() {
    log("Attempting to inject widget...");

    // Remove existing widget
    const existing = document.getElementById("yt-ai-master-widget");
    if (existing) {
        log("Removing existing widget");
        existing.remove();
    }

    // Cleanup previous observer
    if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
    }

    // Wait for YouTube's watch page to be ready
    const watchFlexy = document.querySelector("ytd-watch-flexy");
    if (watchFlexy && !watchFlexy.hasAttribute("video-id")) {
        log("Waiting for video to load...");
        await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Find secondary column with extended selectors
    let secondaryColumn = findSecondaryColumn();
    let attempts = 0;
    const maxAttempts = 15;

    while (!secondaryColumn && attempts < maxAttempts) {
        log(
            `Secondary column not found, waiting... (Attempt ${
                attempts + 1
            }/${maxAttempts})`
        );
        try {
            // Try multiple selectors for YouTube's various layouts
            secondaryColumn = await waitForElement(
                "#secondary-inner, #secondary, #related, ytd-watch-next-secondary-results-renderer, ytd-watch-flexy #secondary",
                800
            );
            if (secondaryColumn) {
                log("Secondary column found after waiting");
                break;
            }
        } catch (error) {
            // Continue waiting
        }
        attempts++;
        // Small delay between attempts
        await new Promise((resolve) => setTimeout(resolve, 200));
    }

    if (!secondaryColumn) {
        logError(
            "Secondary column not found after multiple attempts. Aborting widget injection."
        );
        // Try one more fallback - inject into the page anyway
        secondaryColumn =
            document.querySelector("#columns") ||
            document.querySelector("ytd-watch-flexy");
        if (!secondaryColumn) {
            return;
        }
        log("Using fallback container for widget injection");
    }

    log("Creating widget element...");
    widgetContainer = document.createElement("div");
    widgetContainer.id = "yt-ai-master-widget";
    widgetContainer.innerHTML = createWidgetHTML();

    log("Inserting widget into DOM...");
    secondaryColumn.insertBefore(widgetContainer, secondaryColumn.firstChild);

    // Attach Close Button Listener
    const closeBtn = widgetContainer.querySelector("#yt-ai-close-btn");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            log("Closing widget...");
            widgetContainer.remove();
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        });
    }

    log("Initializing tabs and event listeners...");
    initTabs(widgetContainer);
    attachEventListeners(widgetContainer);

    // Initialize height sync
    updateWidgetHeight();
    const player =
        document.querySelector("#movie_player") ||
        document.querySelector(".html5-video-player");
    if (player) {
        resizeObserver = new ResizeObserver(() => {
            updateWidgetHeight();
        });
        resizeObserver.observe(player);
    }

    log("Widget injection complete ✓");
}

export function getWidget() {
    return widgetContainer;
}
