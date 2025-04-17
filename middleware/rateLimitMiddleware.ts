// middleware/rateLimitMiddleware.ts
const rateLimitStore = new Map<string, { timestamp: number, count: number }>();

const MAX_REQUESTS = 5; // Max 5 uploads/downloads per user per hour
const TIME_FRAME = 3600000; // 1 hour in ms

export const rateLimitMiddleware = (userId: string) => {
  const currentTime = Date.now();

  if (!rateLimitStore.has(userId)) {
    rateLimitStore.set(userId, { timestamp: currentTime, count: 1 });
    return true;
  }

  const userLimit = rateLimitStore.get(userId)!;

  if (currentTime - userLimit.timestamp > TIME_FRAME) {
    userLimit.timestamp = currentTime;
    userLimit.count = 1;
    return true;
  }

  if (userLimit.count < MAX_REQUESTS) {
    userLimit.count++;
    return true;
  }

  return false;
};

export default rateLimitMiddleware;
