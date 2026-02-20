import { DocumentRepository } from '../../repositories/document.repository';
import { AppError } from '../../utils/errors';
import { IDocument } from '../../types/document.types';
import logger from '../../utils/logger';

export class DocumentService {
  private docRepo = new DocumentRepository();

  async uploadDocument(data: Partial<IDocument>): Promise<IDocument> {
    if (!data.user_id || !data.document_type) {
      throw new AppError('Missing required fields', 400);
    }

    const doc = await this.docRepo.create(data as any);
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

    return this.docRepo.update(id, { verification_status: status, verified_by: verifiedBy || null, rejection_reason: reason || null, reviewed_at: new Date() } as any);
  }
}
