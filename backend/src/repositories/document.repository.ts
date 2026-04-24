import { BaseRepository } from './base.repository';
import Document from '../models/document.model';
import { User } from '../models/user.model';
import Address from '../models/address.model';

export class DocumentRepository extends BaseRepository<Document> {
  constructor() {
    super(Document);
  }

  async findByUser(userId: string): Promise<Document[]> {
    return this.model.findAll({ where: { user_id: userId }, include: [{ model: User, as: 'user', attributes: ['id','full_name','email'] }], order: [['uploaded_at','DESC']] });
  }

  async findAllForAdmin(): Promise<Document[]> {
    return this.model.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email', 'phone', 'business_name', 'role', 'status', 'approved_at', 'approved_by'],
          include: [
            {
              model: Address,
              as: 'addresses',
              attributes: ['id', 'region', 'city', 'subcity', 'common_name', 'latitude', 'longitude', 'created_at', 'updated_at'],
            },
          ],
        },
      ],
      order: [['uploaded_at', 'DESC']],
    });
  }
}
