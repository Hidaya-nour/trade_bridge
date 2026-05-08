// src/seeders/06_drivers.js
import { faker } from '@faker-js/faker';
import { Driver } from '../models/driver.model.ts';

const VEHICLE_TYPES = ['Truck', 'Van', 'Pickup', 'Motorcycle', 'Cargo Bike', 'Mini-Truck'];
const DRIVER_TYPES = ['full-time', 'part-time', 'contractor', 'freelance'];

export default async function seedDrivers(seededData) {
  const users = seededData.users;
  const suppliers = users.filter(u => (u.role === 'factory' || u.role === 'distributor') && u.status === 'active');
  const driverUsers = users.filter(u => u.role === 'driver' && u.status === 'active');
  
  const drivers = [];
  
  // Assign driver users to suppliers
  for (let i = 0; i < driverUsers.length && i < suppliers.length * 2; i++) {
    const driverUser = driverUsers[i];
    const supplier = suppliers[i % suppliers.length];
    
    drivers.push({
      id: faker.string.uuid(),
      supplier_id: supplier.id,
      driver_id: driverUser.id,
      driver_type: faker.helpers.arrayElement(DRIVER_TYPES),
      vehicle_type: faker.helpers.arrayElement(VEHICLE_TYPES),
      license_plate: faker.vehicle.vrm(),
      active: faker.datatype.boolean(0.85),
      created_at: driverUser.created_at || faker.date.past(),
      updated_at: faker.date.recent(),
      deleted_at: null,
    });
  }
  
  // Create additional drivers without user accounts (for demo)
  const additionalDrivers = faker.number.int({ min: 5, max: 10 });
  for (let i = 0; i < additionalDrivers && drivers.length < 20; i++) {
    const supplier = suppliers[i % suppliers.length];
    drivers.push({
      id: faker.string.uuid(),
      supplier_id: supplier.id,
      driver_id: faker.string.uuid(),
      driver_type: faker.helpers.arrayElement(DRIVER_TYPES),
      vehicle_type: faker.helpers.arrayElement(VEHICLE_TYPES),
      license_plate: faker.vehicle.vrm(),
      active: faker.datatype.boolean(0.7),
      created_at: faker.date.past(),
      updated_at: faker.date.recent(),
      deleted_at: null,
    });
  }
  
  await Driver.bulkCreate(drivers, { ignoreDuplicates: true });
  return drivers;
}
