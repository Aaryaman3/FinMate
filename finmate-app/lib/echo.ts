import Echo from '@merit-systems/echo-next-sdk';

// Initialize Echo with configuration
// This creates a shared instance that automatically handles authentication
export const {
  // Echo Auth Routes
  handlers,
  // Server-side utils
  getUser,
  isSignedIn,
  // AI Providers (these automatically use the authenticated user's context)
  openai,
  anthropic,
  google,
} = Echo({
  appId: process.env.ECHO_APP_ID!,
  basePath: '/api/echo',
});
