import { describe, it, expect } from 'vitest';
import { NativeDPAPISecurity } from '../security';
import { logger } from '../logger';

describe('DPAPI Security & Logger Redaction Test Suite', () => {
  it('should encrypt and decrypt API credentials securely', async () => {
    const plainApiKey = 'sk-proj-1234567890abcdefghijklmnopqrstuvwxyz';
    const encrypted = await NativeDPAPISecurity.encryptCredential(plainApiKey);

    expect(encrypted).toContain('DPAPI_V1:');
    expect(encrypted).not.toBe(plainApiKey);

    const decrypted = await NativeDPAPISecurity.decryptCredential(encrypted);
    expect(decrypted).toBe(plainApiKey);
  });

  it('should redact sensitive OpenAI and Anthropic API keys from logs', () => {
    const secretMsg = 'Connecting to endpoint with sk-proj-1234567890abcdefghijklmnopqrstuvwxyz key';
    const sanitized = logger.redactSecrets(secretMsg);

    expect(sanitized).not.toContain('sk-proj-1234567890abcdefghijklmnopqrstuvwxyz');
    expect(sanitized).toContain('[REDACTED_SECRET]');
  });
});
