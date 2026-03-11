/**
 * LLM integration placeholder.
 *
 * In Phase 1 this is a stub that echoes the user's message back and describes
 * what the future agent will do.  In a later phase, replace `callLlm` with a
 * real API call (OpenAI, Anthropic, Azure OpenAI, etc.) and wire the response
 * into the component-generation pipeline.
 *
 * The expected future flow:
 *  1. User describes the component in the chat panel.
 *  2. callLlm() sends the message (+ conversation history) to the LLM endpoint.
 *  3. The LLM returns a structured plan (component name, props, behaviour).
 *  4. The runner scaffolds the component files from the plan.
 *  5. The preview server hot-reloads the new component.
 *  6. The user iterates via follow-up chat messages.
 */

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LlmResponse {
  message: string;
  /** Set to true once a real LLM endpoint is wired in. */
  isStub: boolean;
}

/**
 * Send a chat conversation to the LLM (stubbed in Phase 1).
 *
 * To connect a real LLM, replace the body of this function with an API call,
 * e.g.:
 *   const response = await fetch('https://api.openai.com/v1/chat/completions', { ... });
 *
 * Environment variable to add when ready:
 *   OPENAI_API_KEY  (or ANTHROPIC_API_KEY, AZURE_OPENAI_API_KEY, etc.)
 */
export async function callLlm(messages: ChatMessage[]): Promise<LlmResponse> {
  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';

  // --- STUB RESPONSE ---
  const stubReply =
    `Thanks for your message! 🚧\n\n` +
    `You asked: "${lastUserMessage}"\n\n` +
    `In a future phase, this message will be sent to an LLM agent that will:\n` +
    `  1. Understand what React component you want to build.\n` +
    `  2. Generate the component source code.\n` +
    `  3. Create the files in your workspace.\n` +
    `  4. Hot-reload the preview so you can see it immediately.\n\n` +
    `For now, use the action buttons on the right to manually scaffold a component.`;

  return { message: stubReply, isStub: true };
}
