import { BaseRepository } from './base.repository';
import { UserRole, UserStatus } from '../types/auth.types';
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

  /** List users with role=driver (for suppliers to link as their drivers). */
  async findDrivers(search?: string): Promise<User[]> {
    const where: any = {
      role: 'driver',
      status: 'active',
      deleted_at: null,
    };
    if (search && search.trim()) {
      where[Op.or] = [
        { email: { [Op.like]: `%${search.trim()}%` } },
        { full_name: { [Op.like]: `%${search.trim()}%` } },
      ];
    }
    return this.findAll({
      where,
      attributes: ['id', 'full_name', 'email', 'phone'],
      limit: 50,
      order: [['full_name', 'ASC']],
    });
  }

  /** List users with role=distributor (for factories to link as their sales agents). */
  async findDistributors(search?: string): Promise<User[]> {
    const where: any = {
      role: 'distributor',
      status: 'active',
      deleted_at: null,
    };
    if (search && search.trim()) {
      where[Op.or] = [
        { email: { [Op.like]: `%${search.trim()}%` } },
        { full_name: { [Op.like]: `%${search.trim()}%` } },
        { business_name: { [Op.like]: `%${search.trim()}%` } },
      ];
    }
    return this.findAll({
      where,
      attributes: ['id', 'full_name', 'business_name', 'email', 'phone', 'status', 'role'],
      limit: 50,
      order: [['business_name', 'ASC'], ['full_name', 'ASC']],
    });
  }

  async getUsers(options?: {
    limit?: number;
    offset?: number;
    role?: UserRole;
    status?: UserStatus;
    search?: string;
    orderBy?: 'created_at' | 'full_name' | 'email';
    orderDirection?: 'ASC' | 'DESC';
  }): Promise<{ users: User[]; total: number }> {
    const {
      limit = 50,
      offset = 0,
      role,
      status,
      search,
      orderBy = 'created_at',
      orderDirection = 'DESC'
    } = options || {};

    const whereClause: any = {
      deleted_at: null
    };

    if (role) {
      whereClause.role = role;
    }

    if (status) {
      whereClause.status = status;
    }

    if (search && search.trim()) {
      whereClause[Op.or] = [
        { email: { [Op.like]: `%${search}%` } },
        { full_name: { [Op.like]: `%${search}%` } },
        { business_name: { [Op.like]: `%${search}%` } }
      ];
    }

    const users = await this.findAll({
      where: whereClause,
      limit,
      offset,
      order: [[orderBy, orderDirection]]
    });

    const total = await this.count(whereClause);

    return { users, total };
  }

  async getRecentUsers(limit: number = 10): Promise<User[]> {
    return this.findAll({
      where: { deleted_at: null },
      limit,
      order: [['created_at', 'DESC']]
    });
  }
}
