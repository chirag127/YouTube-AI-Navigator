// Re-export all shortcuts from the main utils folder
// This file exists to fix module resolution issues when content scripts
// are dynamically loaded by the browser
export * from '../../utils/shortcuts.js';
