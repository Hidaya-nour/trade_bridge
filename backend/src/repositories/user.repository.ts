import { BaseRepository } from './base.repository';
import { IUser, UserRole, UserStatus } from '../types/auth.types';
import { Op } from 'sequelize';
import User from '../models/user.model';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.model.findOne({
      where: { email },
      attributes: { include: ['password_hash'] }
    });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.findAll({
      where: { status: 'active', deleted_at: null }
    });
  }

  async findPendingApproval(): Promise<User[]> {
    return this.findAll({
      where: { status: 'pending', deleted_at: null },
      order: [['created_at', 'ASC']]
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.update(id, { last_login: new Date() } as Partial<User>);
  }

  async approveUser(id: string, approvedBy: string): Promise<[number, User[]]> {
    return this.update(id, {
      status: 'active',
      verified: true,
      approved_at: new Date(),
      approved_by: approvedBy
    } as Partial<User>);
  }

  async suspendUser(id: string): Promise<[number, User[]]> {
    return this.update(id, { status: 'suspended' } as Partial<User>);
  }

  async searchUsers(query: string, role?: UserRole): Promise<User[]> {
    const whereClause: any = {
      deleted_at: null,
      [Op.or]: [
        { email: { [Op.like]: `%${query}%` } },
        { full_name: { [Op.like]: `%${query}%` } },
        { business_name: { [Op.like]: `%${query}%` } }
      ]
    };

    if (role) {
      whereClause.role = role;
    }

    return this.findAll({ where: whereClause, limit: 20 });
  }
}