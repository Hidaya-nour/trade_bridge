// import Redis from 'ioredis';
// import logger from '../../utils/logger';

// export class RedisService {
//   private client: Redis;

//   constructor() {
//     this.client = new Redis({
//       host: process.env.REDIS_HOST || 'localhost',
//       port: parseInt(process.env.REDIS_PORT || '6379'),
//       password: process.env.REDIS_PASSWORD,
//       retryStrategy: (times) => {
//         const delay = Math.min(times * 50, 2000);
//         return delay;
//       }
//     });

//     this.client.on('connect', () => {
//       logger.info('Redis connected');
//     });

//     this.client.on('error', (error) => {
//       logger.error('Redis error:', error);
//     });
//   }

//   async get(key: string): Promise<any> {
//     const data = await this.client.get(key);
//     return data ? JSON.parse(data) : null;
//   }

//   async set(key: string, value: any, ttl?: number): Promise<void> {
//     const stringValue = JSON.stringify(value);
//     if (ttl) {
//       await this.client.setex(key, ttl, stringValue);
//     } else {
//       await this.client.set(key, stringValue);
//     }
//   }

//   async del(key: string): Promise<void> {
//     await this.client.del(key);
//   }

//   async exists(key: string): Promise<boolean> {
//     const result = await this.client.exists(key);
//     return result === 1;
//   }

//   async expire(key: string, seconds: number): Promise<void> {
//     await this.client.expire(key, seconds);
//   }

//   async increment(key: string): Promise<number> {
//     return this.client.incr(key);
//   }

//   async addToSet(key: string, ...members: string[]): Promise<void> {
//     await this.client.sadd(key, ...members);
//   }

//   async removeFromSet(key: string, ...members: string[]): Promise<void> {
//     await this.client.srem(key, ...members);
//   }

//   async getSetMembers(key: string): Promise<string[]> {
//     return this.client.smembers(key);
//   }

//   async isMemberOfSet(key: string, member: string): Promise<boolean> {
//     const result = await this.client.sismember(key, member);
//     return result === 1;
//   }
// }