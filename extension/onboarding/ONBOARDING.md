# Onboarding System Documentation

## Overview

The YouTube AI Master extension includes a comprehensive onboarding flow that guides new users through initial setup, ensuring they understand the extension's capabilities and have everything configured correctly before first use.

## Architecture

### Files

```
extension/onboarding/
├── onboarding.html      # Multi-step wizard UI
├── onboarding.css       # Styling with gradient theme
├── onboarding.js        # Flow logic and API testing
└── ONBOARDING.md        # This documentation
```

### Integration Points

1. **Service Worker** (`background/service-worker.js`)

    - Detects first install via `chrome.runtime.onInstalled`
    - Opens onboarding page automatically

2. **Popup** (`popup/popup.js`)

    - Shows "Start Setup Guide" button if API key not configured
    - Hides analyze button until setup complete

3. **Options Page** (`options/options.html`)

    - Displays welcome banner for unconfigured users
    - Provides quick access to onboarding

4. **Storage** (`chrome.storage.sync`)
    - Tracks `onboardingCompleted` flag
    - Stores user preferences during flow

## Flow Steps

### Step 0: Welcome

-   **Purpose**: Introduce the extension and its key features
-   **Content**:
    -   Logo and branding
    -   Feature cards (AI Summaries, Smart Segments, Chat, Privacy)
    -   No user input required
-   **Action**: Click "Next" to proceed

### Step 1: API Key Setup

-   **Purpose**: Guide user to obtain and configure Gemini API key
-   **Content**:
    -   Explanation of why API key is needed
    -   Step-by-step instructions with numbered steps
    -   Direct link to Google AI Studio API key page (correct URL)
    -   Input field with show/hide toggle
    -   "Test Connection" button with real-time validation
-   **Validation**:
    -   Tests API key by making actual request to Gemini API
    -   Shows success/error status with clear messaging
    -   Saves key to storage on successful test
-   **Skip Option**: User can skip and configure later

### Step 2: Basic Configuration

-   **Purpose**: Set initial preferences
-   **Settings**:
    -   Output language (dropdown with 10+ languages)
    -   Auto-analyze videos (toggle)
    -   Enable segment detection (toggle, default ON)
-   **Storage**: All changes saved immediately to `chrome.storage.sync`

### Step 3: Completion

-   **Purpose**: Confirm setup and guide next steps
-   **Content**:
    -   Success checkmark animation
    -   "What's Next" guide with 3 action items
    -   Two action buttons:
        -   "Open Settings" - Navigate to full settings page
        -   "Start Using Extension" - Close onboarding and begin
-   **Action**: Marks `onboardingCompleted: true` in storage

## API Key Validation

### Test Connection Flow

```javascript
async testApiKey() {
    const apiKey = input.value.trim();

    // Validate non-empty
    if (!apiKey) {
        showError('Please enter an API key');
        return;
    }

    // Test with real Gemini API request
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: 'Hello' }] }]
            })
        }
    );

    if (response.ok) {
        // Save to storage
        await chrome.storage.sync.set({ apiKey });
        showSuccess('Connection successful!');
        // Auto-advance after 1.5s
        setTimeout(() => nextStep(), 1500);
    } else {
        const error = await response.json();
        showError(error.error?.message || 'Invalid API key');
    }
}
```

### Error Handling

-   **Empty input**: "Please enter an API key"
-   **Invalid key**: Displays actual API error message
-   **Network error**: "Connection failed: [error details]"
-   **Success**: "✓ Connection successful! API key saved."

## State Management

### Storage Schema

```javascript
{
    onboardingCompleted: boolean,  // Has user finished onboarding?
    apiKey: string,                // Gemini API key
    outputLanguage: string,        // Preferred output language
    autoAnalyze: boolean,          // Auto-analyze on page load
    enableSegments: boolean        // Enable segment detection
}
```

### State Checks

**Popup Logic**:

```javascript
if (!onboardingCompleted && !apiKey) {
    showSetupGuideButton();
    hideAnalyzeButton();
}
```

**Options Page Logic**:

```javascript
if (!onboardingCompleted && !apiKey) {
    showWelcomeBanner();
}
```

## UI/UX Design

### Visual Theme

-   **Gradient**: Purple-blue gradient (`#667eea` → `#764ba2`)
-   **Typography**: Inter font family
-   **Colors**:
    -   Success: `#10b981` (green)
    -   Error: `#fee2e2` (red background), `#991b1b` (red text)
    -   Loading: `#dbeafe` (blue background), `#1e40af` (blue text)

### Progress Indicators

-   **Progress bar**: Fills 25% per step (0% → 25% → 50% → 75% → 100%)
-   **Step dots**: 4 dots, active state highlighted, completed state green
-   **Navigation**: Back/Next buttons, Back disabled on first step, Next hidden on last step

### Animations

-   **Step transitions**: Slide in from right, slide out to left
-   **Button hover**: Slight lift effect (`translateY(-2px)`)
-   **Success icon**: Large green checkmark in circle

## Accessibility

-   **Keyboard navigation**: Tab through inputs and buttons
-   **Screen reader support**: Semantic HTML with proper labels
-   **Focus states**: Clear visual indicators
-   **Error messages**: Associated with inputs via ARIA

## Testing Checklist

-   [ ] First install opens onboarding automatically
-   [ ] API key test with valid key succeeds
-   [ ] API key test with invalid key shows error
-   [ ] API key test with empty input shows validation error
-   [ ] Settings save correctly to storage
-   [ ] Skip option works (can configure later)
-   [ ] Back button navigates to previous step
-   [ ] Next button advances to next step
-   [ ] Progress bar updates correctly
-   [ ] Step dots reflect current position
-   [ ] "Start Using Extension" closes onboarding
-   [ ] "Open Settings" navigates to options page
-   [ ] Popup shows setup guide button when not configured
-   [ ] Options page shows welcome banner when not configured
-   [ ] Re-running onboarding works from popup/options

## Future Enhancements

-   [ ] Add video tutorial embed
-   [ ] Include interactive demo of features
-   [ ] Add "Skip for now" on each step
-   [ ] Track analytics (if user consents)
-   [ ] A/B test different onboarding flows
-   [ ] Add tooltips for advanced settings
-   [ ] Include FAQ section
-   [ ] Add "Contact Support" link

## Maintenance

### Updating API Key URL

The correct Google AI Studio API key URL is:

```
https://aistudio.google.com/app/apikey
```

**Do NOT use**:

-   `https://ai.google.dev/` (homepage, not direct to keys)
-   `https://makersuite.google.com/` (deprecated)

### Adding New Steps

To add a new step:

1. Update `totalSteps` in `onboarding.js`
2. Add new step HTML in `onboarding.html`
3. Add step dot in indicators
4. Update progress calculation
5. Add step logic in `updateUI()` and `loadStepData()`

### Localization

To add translations:

1. Create language-specific HTML files (e.g., `onboarding-es.html`)
2. Detect user language via `navigator.language`
3. Load appropriate HTML file
4. Update storage schema to include `onboardingLanguage`

## Support

For issues or questions about the onboarding system:

-   Check browser console for errors
-   Verify storage state: `chrome.storage.sync.get(console.log)`
-   Test API key manually at Google AI Studio
-   Review network requests in DevTools

---

**Last Updated**: 2024
**Version**: 2.0.0
