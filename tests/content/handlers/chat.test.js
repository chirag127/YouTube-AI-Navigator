import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../../');

describe('Chat Handler', () => {
  let sendChatMessage;
  let originalChrome;

  beforeEach(async () => {
    vi.clearAllMocks();
    document.body.innerHTML = '';

    // Setup global chrome mock BEFORE importing chat.js
    originalChrome = global.chrome;

    global.chrome = {
      runtime: {
        getURL: (p) => {
          const absPath = path.join(projectRoot, 'extension', p);
          return `file://${absPath.replace(/\\/g, '/')}`;
        },
        sendMessage: vi.fn().mockResolvedValue({ success: true, answer: 'Test answer' }),
      },
      storage: {
        local: { get: vi.fn().mockResolvedValue({}) },
        sync: { get: vi.fn().mockResolvedValue({}) },
      }
    };

    // Setup DOM for chat
    const input = document.createElement('input');
    input.id = 'yt-ai-chat-input';
    input.value = 'Hello';
    document.body.appendChild(input);

    const chatContainer = document.createElement('div');
    chatContainer.id = 'yt-ai-chat-messages';
    chatContainer.className = 'yt-ai-chat-messages';
    document.body.appendChild(chatContainer);

    // Dynamically import the module under test
    // This will load real dependencies using the real file paths from getURL
    vi.resetModules();
    const module = await import('../../../extension/content/handlers/chat.js');
    sendChatMessage = module.sendChatMessage;
  });

  afterEach(() => {
    global.chrome = originalChrome;
  });

  it('should send chat message successfully using real dependencies', async () => {
    // We need to mock state.currentTranscript because chat.js uses it
    // But state.js is a real module. We can import it and modify it?
    // state.js exports 'state' as a const object (but properties are mutable).
    // Let's import it and set it.

    // We need to import the SAME instance that chat.js imported.
    // Since we use absolute paths in getURL, we must import using the same absolute path
    // to get the same module instance.
    const statePath = path.join(projectRoot, 'extension/content/core/state.js');
    const stateUrl = `file://${statePath.replace(/\\/g, '/')}`;
    const { state } = await import(stateUrl);

    state.currentTranscript = [{ text: 'line 1' }, { text: 'line 2' }];

    await sendChatMessage();

    // Verify the message was added to DOM
    const messages = document.querySelectorAll('.yt-ai-chat-msg');
    // Expect:
    // 1. User message "Hello"
    // 2. AI message "Thinking..." -> then "Test answer"

    // Since sendChatMessage is async and awaits response, by the time it returns,
    // the answer should be rendered.

    expect(messages.length).toBeGreaterThanOrEqual(2);
    expect(messages[messages.length - 1].innerHTML).toContain('Test answer');
  });
});
