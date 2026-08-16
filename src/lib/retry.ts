export interface RetryOptions {
  maxAttempts: number;
  baseDelayMs?: number;
  shouldRetry?: (err: unknown) => boolean;
  getRetryAfterMs?: (err: unknown) => number | null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const { maxAttempts, baseDelayMs = 500, shouldRetry = () => true, getRetryAfterMs } = options;

  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === maxAttempts || !shouldRetry(err)) throw err;

      const delayMs = getRetryAfterMs?.(err) ?? baseDelayMs * 2 ** (attempt - 1);
      await sleep(delayMs);
    }
  }

  throw lastErr;
}
