import { DocumentRepository } from '../../repositories/document.repository';
import { UserRepository } from '../../repositories/user.repository';
import { AppError } from '../../utils/errors';
import { IDocument } from '../../types/document.types';
import logger from '../../utils/logger';
import { isCloudinaryConfigured, uploadBufferToCloudinary } from '../../config/cloudinary';

export class DocumentService {
  private docRepo = new DocumentRepository();
  private userRepo = new UserRepository();

  async uploadDocument(data: Partial<IDocument>, file: Express.Multer.File): Promise<IDocument> {
    if (!data.user_id || !data.document_type) {
      throw new AppError('Missing required fields', 400);
    }

    if (!file) {
      throw new AppError('Document file is required', 400);
    }

    if (!isCloudinaryConfigured()) {
      throw new AppError(
        'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.',
        500
      );
    }

    const folder = `trade_bridge/documents/${data.user_id}/${data.document_type}`;
    const uploaded = await uploadBufferToCloudinary(file, folder);

    const payload: Partial<IDocument> = {
      ...data,
      cloudinary_public_id: uploaded.public_id,
      cloudinary_resource_type: uploaded.resource_type as any,
      cloudinary_format: uploaded.format,
      cloudinary_version: String(uploaded.version),
      file_secure_url: uploaded.secure_url,
      original_file_name: file.originalname,
      file_size: file.size,
      issued_date: data.issued_date ? new Date(data.issued_date) : null,
      expiry_date: data.expiry_date ? new Date(data.expiry_date) : null,
    };

    const doc = await this.docRepo.create(payload as any);
    logger.info(`Document uploaded for user ${data.user_id}`);
    return doc as IDocument;
  }

  async getUserDocuments(userId: string): Promise<IDocument[]> {
    return this.docRepo.findByUser(userId) as Promise<IDocument[]>;
  }

  async getDocumentById(id: string): Promise<IDocument | null> {
    return this.docRepo.findById(id) as Promise<IDocument | null>;
  }

  async updateVerification(id: string, status: IDocument['verification_status'], verifiedBy?: string, reason?: string) {
    const doc = await this.getDocumentById(id);
    if (!doc) throw new AppError('Document not found', 404);

    const updated = await this.docRepo.update(id, { verification_status: status, verified_by: verifiedBy || null, rejection_reason: reason || null, reviewed_at: new Date() } as any);

    // If a business license is verified for factory/distributor, approve the account.
    if (status === 'verified' && doc.document_type === 'business_license' && doc.user_id) {
      const user = await this.userRepo.findById(doc.user_id);
      if (user && ['factory', 'distributor'].includes(user.role)) {
        await this.userRepo.approveUser(user.id, verifiedBy || user.id);
        logger.info(`User ${user.id} approved after license verification.`);
      }
    }

    return updated;
  }
}
