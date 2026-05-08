// src/seeders/21_login_attempts.js
import { faker } from '@faker-js/faker';
import { LoginAttempt } from '../models/login-attempt.model.ts';

export default async function seedLoginAttempts(seededData) {
  const users = seededData.users;
  
  const attempts = [];
  
  // Generate 2-10 login attempts per active user
  const activeUsers = users.filter(u => u.status === 'active');
  
  for (const user of activeUsers) {
    const numAttempts = faker.number.int({ min: 2, max: 20 });
    
    for (let i = 0; i < numAttempts; i++) {
      const isSuccess = faker.datatype.boolean(0.85);
      
      attempts.push({
        id: faker.string.uuid(),
        email: user.email,
        ip_address: faker.internet.ip(),
        user_agent: faker.internet.userAgent(),
        success: isSuccess,
        attempted_at: faker.date.recent({ days: 90 }),
      });
    }
  }
  
  // Add some failed attempts from non-existent users
  const numFailedAttempts = faker.number.int({ min: 50, max: 200 });
  for (let i = 0; i < numFailedAttempts; i++) {
    attempts.push({
      id: faker.string.uuid(),
      email: faker.internet.email(),
      ip_address: faker.internet.ip(),
      user_agent: faker.internet.userAgent(),
      success: false,
      attempted_at: faker.date.recent({ days: 30 }),
    });
  }
  
  await LoginAttempt.bulkCreate(attempts, { ignoreDuplicates: true });
  return attempts;
}
