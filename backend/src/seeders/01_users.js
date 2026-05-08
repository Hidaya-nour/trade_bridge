// src/seeders/01_users.js
import { faker } from '@faker-js/faker';
import { User } from '../models/user.model.ts';
import { hashPassword } from './seedHelpers.js';

const toMax = (value, max) => String(value ?? '').slice(0, max);

const randomPhone = () => {
  // Keep only digits and clamp to model max length (20 chars).
  const digits = faker.string.numeric({ length: { min: 10, max: 15 } });
  return digits.slice(0, 20);
};

const uniqueEmail = (prefix, domain, i) =>
  `${prefix}${i + 1}_${faker.string.alphanumeric(6).toLowerCase()}@${domain}`;

const FOOD_DRINK_BUSINESS_TYPES = ['Food', 'Drink'];
const FOOD_FACTORY_NAMES = [
  'Fresh Harvest Foods',
  'Golden Grain Foods',
  'Daily Table Foods',
  'Urban Pantry Foods',
];
const DRINK_FACTORY_NAMES = [
  'Pure Spring Drinks',
  'Highland Drinks',
  'Blue Nile Drinks',
  'Refresh House Drinks',
];

const generateUsers = async () => {
  const users = [];
  const now = new Date();
  
  // Admin users (2)
  for (let i = 0; i < 2; i++) {
    users.push({
      id: faker.string.uuid(),
      email: i === 0 ? 'admin@platform.com' : `admin${i + 1}@platform.com`,
      full_name: i === 0 ? 'System Administrator' : faker.person.fullName(),
      role: 'admin',
      status: 'active',
      phone: randomPhone(),
      password_hash: await hashPassword('Admin@123'),
      business_name: null,
      tin_number: null,
      is_vat_registered: false,
      vat_rate: 0.15,
      profile_image: faker.image.avatar(),
      verified: true,
      created_at: faker.date.past({ years: 1 }),
      updated_at: now,
      approved_at: faker.date.past({ years: 1 }),
      approved_by: null,
      last_login: faker.date.recent(),
      chapa_subaccount_id: null,
    });
  }
  
  // Factories (20)
  for (let i = 0; i < 20; i++) {
    const status = faker.helpers.arrayElement(['active', 'pending']);
    const businessType = faker.helpers.arrayElement(FOOD_DRINK_BUSINESS_TYPES);
    const businessBase = businessType === 'Food'
      ? faker.helpers.arrayElement(FOOD_FACTORY_NAMES)
      : faker.helpers.arrayElement(DRINK_FACTORY_NAMES);
    users.push({
      id: faker.string.uuid(),
      email: uniqueEmail('factory', 'factory.com', i),
      full_name: faker.person.fullName(),
      role: 'factory',
      status,
      phone: randomPhone(),
      password_hash: await hashPassword('Factory@123'),
      business_name: toMax(`${businessBase} Factory`, 100),
      tin_number: faker.string.numeric(10),
      is_vat_registered: faker.datatype.boolean(0.8),
      vat_rate: 0.15,
      profile_image: faker.image.avatar(),
      verified: status === 'active',
      created_at: faker.date.past({ years: 1 }),
      updated_at: now,
      approved_at: status === 'active' ? faker.date.past({ years: 1 }) : null,
      approved_by: status === 'active' ? users[0]?.id : null,
      last_login: status === 'active' ? faker.date.recent() : null,
      chapa_subaccount_id: `chapa_sub_${faker.string.alphanumeric(10)}`,
    });
  }
  
  // Distributors (25)
  for (let i = 0; i < 25; i++) {
    const status = faker.helpers.arrayElement(['active', 'pending', 'suspended']);
    const businessType = faker.helpers.arrayElement(FOOD_DRINK_BUSINESS_TYPES);
    const businessBase = businessType === 'Food'
      ? faker.helpers.arrayElement(FOOD_FACTORY_NAMES)
      : faker.helpers.arrayElement(DRINK_FACTORY_NAMES);
    users.push({
      id: faker.string.uuid(),
      email: uniqueEmail('distributor', 'distributor.com', i),
      full_name: faker.person.fullName(),
      role: 'distributor',
      status,
      phone: randomPhone(),
      password_hash: await hashPassword('Distributor@123'),
      business_name: toMax(`${businessBase} Distribution`, 100),
      tin_number: faker.string.numeric(10),
      is_vat_registered: faker.datatype.boolean(0.7),
      vat_rate: 0.15,
      profile_image: faker.image.avatar(),
      verified: status === 'active',
      created_at: faker.date.past({ years: 1 }),
      updated_at: now,
      approved_at: status === 'active' ? faker.date.past({ years: 1 }) : null,
      approved_by: status === 'active' ? users[0]?.id : null,
      last_login: status === 'active' ? faker.date.recent() : null,
      chapa_subaccount_id: `chapa_sub_${faker.string.alphanumeric(10)}`,
    });
  }
  
  // Retailers (40)
  for (let i = 0; i < 40; i++) {
    const status = faker.helpers.arrayElement(['active', 'pending', 'suspended']);
    users.push({
      id: faker.string.uuid(),
      email: uniqueEmail('retailer', 'retailer.com', i),
      full_name: faker.person.fullName(),
      role: 'retailer',
      status,
      phone: randomPhone(),
      password_hash: await hashPassword('Retailer@123'),
      business_name: toMax(`${faker.company.name()} Retail Store`, 100),
      tin_number: faker.datatype.boolean(0.5) ? faker.string.numeric(10) : null,
      is_vat_registered: faker.datatype.boolean(0.3),
      vat_rate: 0.15,
      profile_image: faker.image.avatar(),
      verified: status === 'active',
      created_at: faker.date.past({ years: 1 }),
      updated_at: now,
      approved_at: status === 'active' ? faker.date.past({ years: 1 }) : null,
      approved_by: status === 'active' ? users.find(u => u.role === 'admin')?.id : null,
      last_login: status === 'active' ? faker.date.recent() : null,
      chapa_subaccount_id: null,
    });
  }
  
  // Drivers (13)
  for (let i = 0; i < 13; i++) {
    const status = faker.helpers.arrayElement(['active', 'pending', 'suspended']);
    users.push({
      id: faker.string.uuid(),
      email: uniqueEmail('driver', 'driver.com', i),
      full_name: faker.person.fullName(),
      role: 'driver',
      status,
      phone: randomPhone(),
      password_hash: await hashPassword('Driver@123'),
      business_name: null,
      tin_number: null,
      is_vat_registered: false,
      vat_rate: 0.15,
      profile_image: faker.image.avatar(),
      verified: status === 'active',
      created_at: faker.date.past({ years: 1 }),
      updated_at: now,
      approved_at: status === 'active' ? faker.date.past({ years: 1 }) : null,
      approved_by: status === 'active' ? users.find(u => u.role === 'admin')?.id : null,
      last_login: status === 'active' ? faker.date.recent() : null,
      chapa_subaccount_id: null,
    });
  }
  
  return users;
};

export default async function seedUsers() {
  const users = await generateUsers();
  try {
    await User.bulkCreate(users, {
      individualHooks: true,
      validate: true,
      ignoreDuplicates: true,
    });
  } catch (error) {
    console.error('User seed validation details:', error?.errors || error?.parent || error);
    throw error;
  }
  return users;
}

