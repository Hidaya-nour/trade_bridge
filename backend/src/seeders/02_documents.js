// src/seeders/02_documents.js
import { faker } from '@faker-js/faker';
import { Document } from '../models/document.model.ts';
import { uploadDocument, getRandomItems } from './seedHelpers.js';

const DOCUMENT_TYPES = ['id_card', 'business_license', 'tax_certificate', 'other'];
const VERIFICATION_STATUSES = ['pending', 'verified', 'rejected'];
const STATUS_WEIGHTS = [0.2, 0.7, 0.1];

export default async function seedDocuments(seededData, options = {}) {
  const users = seededData.users || await import('./01_users.js').then(m => m.default());
  
  const documents = [];
  let docIdCounter = 0;
  
  for (const user of users) {
    // Skip drivers and pending users for documents
    if (user.role === 'driver' || user.status === 'pending') continue;
    
    const numDocuments = faker.number.int({ min: 1, max: 3 });
    
    for (let i = 0; i < numDocuments; i++) {
      const docType = faker.helpers.arrayElement(DOCUMENT_TYPES);
      const verificationStatus = faker.helpers.arrayElement(VERIFICATION_STATUSES);
      const isVerified = verificationStatus === 'verified';
      
      let documentData = {
        id: faker.string.uuid(),
        user_id: user.id,
        document_type: docType,
        verification_status: verificationStatus,
        uploaded_at: user.created_at || faker.date.past(),
        reviewed_at: isVerified ? faker.date.recent() : null,
        verified_by: isVerified ? users.find(u => u.role === 'admin')?.id : null,
        rejection_reason: verificationStatus === 'rejected' ? faker.lorem.sentence() : null,
        updated_at: faker.date.recent(),
      };
      
      // Upload to Cloudinary if not skipped
      if (!options.skipCloudinary) {
        const uploadResult = await uploadDocument(user.id, docType, docIdCounter++);
        if (uploadResult) {
          Object.assign(documentData, uploadResult);
        } else {
          // Fallback data
          documentData.cloudinary_public_id = `documents/${user.id}/${docType}_fallback`;
          documentData.file_secure_url = `https://example.com/documents/${user.id}/${docType}`;
          documentData.original_file_name = `${docType}_document.pdf`;
          documentData.file_size = faker.number.int({ min: 100000, max: 5000000 });
        }
      } else {
        // Mock data when Cloudinary is skipped
        documentData.cloudinary_public_id = `documents/${user.id}/${docType}_mock`;
        documentData.file_secure_url = `https://mock-cdn.com/documents/${user.id}/${docType}.pdf`;
        documentData.original_file_name = `${docType}_document.pdf`;
        documentData.file_size = faker.number.int({ min: 100000, max: 5000000 });
        documentData.cloudinary_resource_type = 'raw';
        documentData.cloudinary_format = 'pdf';
      }
      
      documents.push(documentData);
    }
  }
  
  await Document.bulkCreate(documents, { ignoreDuplicates: true });
  return documents;
}
