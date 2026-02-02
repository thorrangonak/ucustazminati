import { describe, it, expect } from 'vitest';
import { Resend } from 'resend';

describe('Email Service', () => {
  it('should have valid Resend API key format', () => {
    const apiKey = process.env.RESEND_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe('');
    expect(apiKey?.startsWith('re_')).toBe(true);
    console.log('Resend API key is configured correctly (format: re_...)');
  });

  it('should be able to initialize Resend client', () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not set');
    }

    // Just test that we can create a Resend instance without errors
    const resend = new Resend(apiKey);
    expect(resend).toBeDefined();
    expect(resend.emails).toBeDefined();
    console.log('Resend client initialized successfully');
  });
});
