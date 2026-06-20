interface RateLimitStore {
  [key: string]: { count: number; resetAt: number };
}

const store: RateLimitStore = {};

export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): Promise<{ success: boolean; remaining: number }> {
  const now = Date.now();
  const key = identifier;

  if (!store[key] || store[key].resetAt < now) {
    store[key] = { count: 1, resetAt: now + windowMs };
    return { success: true, remaining: limit - 1 };
  }

  if (store[key].count >= limit) {
    return { success: false, remaining: 0 };
  }

  store[key].count++;
  return { success: true, remaining: limit - store[key].count };
}

setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  });
}, 60000);
