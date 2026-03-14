/**
 * Validates required environment variables at startup.
 * Logs a console warning (not throw) so the app still boots in dev
 * even if vars are missing, but surfaces issues clearly.
 */
export function validateEnv(): void {
  const required: Record<string, string | undefined> = {
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    NEXT_PUBLIC_CONTRACT_NAME:    process.env.NEXT_PUBLIC_CONTRACT_NAME,
    NEXT_PUBLIC_NETWORK:          process.env.NEXT_PUBLIC_NETWORK,
  };

  const missing = Object.entries(required)
    .filter(([, v]) => !v || v.trim() === '')
    .map(([k]) => k);

  if (missing.length > 0) {
    console.warn(
      `[Flut] Missing environment variable(s): ${missing.join(', ')}.\n` +
      'Copy .env.example to .env.local and fill in the values.',
    );
  }
}
