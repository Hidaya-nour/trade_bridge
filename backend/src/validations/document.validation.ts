import Joi from 'joi';

export const uploadDocumentSchema = Joi.object({
  document_type: Joi.string().valid('id_card','business_license','tax_certificate','other').required(),
  cloudinary_public_id: Joi.string().optional(),
  cloudinary_resource_type: Joi.string().valid('image','raw','video').optional(),
  cloudinary_format: Joi.string().optional(),
  cloudinary_version: Joi.string().optional(),
  file_secure_url: Joi.string().uri().optional(),
  original_file_name: Joi.string().optional(),
  file_size: Joi.number().optional(),
  issued_date: Joi.date().optional(),
  expiry_date: Joi.date().optional()
});
