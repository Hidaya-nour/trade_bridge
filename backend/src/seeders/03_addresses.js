// src/seeders/03_addresses.js
import { faker } from '@faker-js/faker';
import { Address } from '../models/address.model.js';
import { regions, cities } from './seedHelpers.js';

export default async function seedAddresses(seededData) {
  const users = seededData.users;
  
  const addresses = [];
  
  for (const user of users) {
    // Skip pending users
    if (user.status === 'pending') continue;
    
    const numAddresses = faker.number.int({ min: 1, max: user.role === 'factory' ? 3 : 2 });
    
    for (let i = 0; i < numAddresses; i++) {
      const region = faker.helpers.arrayElement(regions);
      const cityList = cities[region] || ['Main City'];
      const city = faker.helpers.arrayElement(cityList);
      
      addresses.push({
        id: faker.string.uuid(),
        user_id: user.id,
        region: region,
        city: city,
        subcity: faker.location.street(),
        common_name: i === 0 ? 'Primary Location' : `Location ${i + 1}`,
        latitude: parseFloat(faker.location.latitude()),
        longitude: parseFloat(faker.location.longitude()),
        created_at: user.created_at || faker.date.past(),
        updated_at: faker.date.recent(),
        deleted_at: null,
      });
    }
  }
  
  await Address.bulkCreate(addresses, { ignoreDuplicates: true });
  return addresses;
}