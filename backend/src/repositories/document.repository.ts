import { BaseRepository } from './base.repository';
import Document from '../models/document.model';
import { User } from '../models/user.model';

export class DocumentRepository extends BaseRepository<Document> {
  constructor() {
    super(Document);
  }

  async findByUser(userId: string): Promise<Document[]> {
    return this.model.findAll({ where: { user_id: userId }, include: [{ model: User, as: 'user', attributes: ['id','full_name','email'] }], order: [['uploaded_at','DESC']] });
  }
}
