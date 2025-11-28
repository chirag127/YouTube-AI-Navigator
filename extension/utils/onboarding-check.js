export class OnboardingChecker {
    static async isCompleted() {
        const result = await chrome.storage.sync.get('onboardingCompleted');
        return result.onboardingCompleted === true;
    }

    static async hasApiKey() {
        const result = await chrome.storage.sync.get('apiKey');
        return !!(result.apiKey && result.apiKey.trim());
    }

    static async shouldShowOnboarding() {
        const completed = await this.isCompleted();
        return !completed;
    }

    static async openOnboarding() {
        const url = chrome.runtime.getURL('onboarding/onboarding.html');
        await chrome.tabs.create({ url });
    }

    static async checkAndPrompt() {
        const shouldShow = await this.shouldShowOnboarding();
        if (shouldShow) {
            await this.openOnboarding();
            return false;
        }

        const hasKey = await this.hasApiKey();
        if (!hasKey) {
            console.warn('API key not configured. Some features may not work.');
            return false;
        }

        return true;
    }

    static async markCompleted() {
        await chrome.storage.sync.set({ onboardingCompleted: true });
    }
}
