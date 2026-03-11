/**
 * Chat / LLM route.
 *
 * Phase 1: stubs LLM responses. The endpoint already accepts the full
 * conversation history so hooking in a real LLM later requires only
 * replacing the `callLlm` implementation.
 *
 * Future phases will extend this route to:
 *  - Extract component specifications from the conversation.
 *  - Trigger component scaffolding automatically.
 *  - Stream partial tokens back via SSE.
 */
import { Router, Request, Response } from 'express';
import { callLlm, ChatMessage } from '../services/llm';

const router = Router();

/**
 * POST /api/chat/message
 * Body: { messages: ChatMessage[] }
 * Returns: { reply: string; isStub: boolean }
 */
router.post('/message', async (req: Request, res: Response) => {
  const { messages } = req.body as { messages?: ChatMessage[] };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages array is required.' });
    return;
  }

  const result = await callLlm(messages);
  res.json({ reply: result.message, isStub: result.isStub });
});

export default router;
