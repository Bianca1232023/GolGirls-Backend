import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { createTransport } = vi.hoisted(() => ({
  createTransport: vi.fn(),
}));

vi.mock('nodemailer', () => ({
  default: { createTransport },
}));

describe('email delivery', () => {
  beforeEach(() => {
    vi.resetModules();
    createTransport.mockReset();
    vi.stubEnv('SMTP_HOST', 'smtp.example.test');
    vi.stubEnv('SMTP_USER', 'sender@example.test');
    vi.stubEnv('SMTP_PASS', 'test-password');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('reports an error when SMTP is not configured', async () => {
    vi.stubEnv('SMTP_PASS', '');
    const { sendPasswordSetupEmail } = await import('../utils/email.js');

    await expect(sendPasswordSetupEmail('invitee@example.test', 'token'))
      .rejects.toMatchObject({ status: 503 });
    expect(createTransport).not.toHaveBeenCalled();
  });

  it('does not report success when the SMTP server rejects the message', async () => {
    const sendMail = vi.fn().mockRejectedValue(new Error('Invalid login'));
    createTransport.mockReturnValue({ sendMail });
    const { sendPasswordSetupEmail } = await import('../utils/email.js');
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(sendPasswordSetupEmail('invitee@example.test', 'token'))
      .rejects.toMatchObject({ status: 502 });
    expect(sendMail).toHaveBeenCalledOnce();
  });
});
