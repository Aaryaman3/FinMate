import { Opik } from 'opik';

// Initialize Opik client (reads from env vars automatically)
export const opikClient = new Opik({
  apiKey: process.env.OPIK_API_KEY,
  workspaceName: process.env.OPIK_WORKSPACE,
});

// Helper to create traced functions
export function traced(name: string, fn: Function) {
  return async (...args: any[]) => {
    const trace = opikClient.trace({
      name,
      input: { args },
      projectName: 'finmate'
    });
    
    try {
      const result = await fn(...args);
      trace.end();
      return result;
    } catch (error) {
      trace.end();
      throw error;
    }
  };
}
