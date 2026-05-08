// src/seeders/05_payment_methods.js
import { faker } from '@faker-js/faker';
import { SupplierPaymentMethod } from '../models/supplier-payment-method.model.ts';

const METHOD_TYPES = ['bank_transfer', 'mobile_money', 'cash', 'credit'];
const PROVIDERS = {
  bank_transfer: ['Commercial Bank', 'Dashen Bank', 'Awash Bank', 'Hibret Bank'],
  mobile_money: ['M-Pesa', 'TeleBirr', 'HelloCash', 'CBE Birr'],
  cash: ['Cash'],
  credit: ['Credit'],
};

export default async function seedPaymentMethods(seededData) {
  const users = seededData.users;
  const suppliers = users.filter(u => (u.role === 'factory' || u.role === 'distributor') && u.status === 'active');
  
  const paymentMethods = [];
  
  for (const supplier of suppliers) {
    const numMethods = faker.number.int({ min: 1, max: 3 });
    let isPrimarySet = false;
    
    for (let i = 0; i < numMethods; i++) {
      const methodType = faker.helpers.arrayElement(METHOD_TYPES);
      const provider = faker.helpers.arrayElement(PROVIDERS[methodType] || ['Other']);
      
      paymentMethods.push({
        id: faker.string.uuid(),
        supplier_id: supplier.id,
        method_type: methodType,
        provider_name: provider,
        account_holder_name: supplier.business_name || supplier.full_name,
        account_identifier: methodType === 'mobile_money' 
          ? faker.phone.number()
          : faker.finance.accountNumber(),
        account_display: methodType === 'mobile_money'
          ? faker.phone.number().slice(-4)
          : faker.finance.accountNumber().slice(-6),
        credit_due_days: methodType === 'credit' ? faker.number.int({ min: 15, max: 90 }) : null,
        credit_limit: methodType === 'credit' ? parseFloat(faker.commerce.price({ min: 10000, max: 500000 })) : null,
        is_primary: !isPrimarySet && i === 0,
        is_active: faker.datatype.boolean(0.9),
        created_at: supplier.created_at || faker.date.past(),
        updated_at: faker.date.recent(),
        deleted_at: null,
      });
      
      if (!isPrimarySet && i === 0) isPrimarySet = true;
    }
  }
  
  await SupplierPaymentMethod.bulkCreate(paymentMethods, { ignoreDuplicates: true });
  return paymentMethods;
}
