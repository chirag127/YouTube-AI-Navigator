import { initializeServices, getServices } from '../services.js';
import { getApiKey } from '../utils/api-key.js';
import { e, l } from '../../utils/shortcuts/log.js';

export async function handleChatWithVideo(req, rsp) {
  const { question, context, metadata } = req;
  l(`[Chat] Processing question: ${question?.substring(0, 50)}...`);

  try {
    const k = await getApiKey();
    if (!k) {
      e(`[Chat:Fail] API key not configured`);
      rsp({ success: false, error: 'API Key not configured' });
      return;
    }

    await initializeServices(k);
    const { gemini } = getServices();
    const ctx = `Video Metadata:\nTitle: ${metadata?.title || 'Unknown'}\nChannel: ${metadata?.author || 'Unknown'}\n\nTranscript Context:\n${context}\n`;
    const ans = await gemini.chatWithVideo(question, ctx, null);
    l(`[Chat] Response generated successfully`);
    rsp({ success: true, answer: ans });
  } catch (error) {
    e(`[Chat:Fail] Error processing chat:`, error.message);
    rsp({ success: false, error: error.message });
  }
}
