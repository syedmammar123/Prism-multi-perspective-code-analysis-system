import { createHmac, timingSafeEqual } from 'crypto';

export function verifySignature(
  rawBody: Buffer | string,
  signatureHeader: string,
  secret: string
): boolean {
  const expected = `sha256=${createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')}`;

  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signatureHeader);

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}
