// Auto-Save Utility with Debouncing
export class AutoSave {
    constructor(settingsManager, delay = 500) {
        this.settings = settingsManager;
        this.delay = delay;
        this.timeout = null;
        this.indicator = null;
        this.createIndicator();
    }

    createIndicator() {
        this.indicator = document.createElement('div');
        this.indicator.id = 'auto-save-indicator';
        this.indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 8px 16px;
            background: #4caf50;
            color: white;
            border-radius: 4px;
            font-size: 14px;
            opacity: 0;
            transition: opacity 0.3s;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(this.indicator);
    }

    show(message = 'Saving...') {
        this.indicator.textContent = message;
        this.indicator.style.opacity = '1';
    }

    hide() {
        this.indicator.style.opacity = '0';
    }

    async save(path, value) {
        clearTimeout(this.timeout);
        this.show('Saving...');

        this.timeout = setTimeout(async () => {
            try {
                await this.settings.update(path, value);
                this.show('✓ Saved');
                setTimeout(() => this.hide(), 1500);
            } catch (e) {
                this.show('✗ Save failed');
                console.error('[AutoSave] Failed:', e);
                setTimeout(() => this.hide(), 2000);
            }
        }, this.delay);
    }

    attachToInput(element, path, transform = (v) => v) {
        if (!element) return;

        const handler = (e) => {
            const value = element.type === 'checkbox'
                ? element.checked
                : element.value;
            this.save(path, transform(value));
        };

        element.addEventListener('change', handler);
        element.addEventListener('input', handler);
    }

    attachToAll(mappings) {
        Object.entries(mappings).forEach(([id, config]) => {
            const el = document.getElementById(id);
            if (el) {
                this.attachToInput(el, config.path, config.transform);
            }
        });
    }
}
