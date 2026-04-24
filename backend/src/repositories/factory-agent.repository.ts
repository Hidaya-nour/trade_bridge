import { BaseRepository } from './base.repository';
import FactoryAgent from '../models/factory-agent.model';
import User from '../models/user.model';
import Document from '../models/document.model';
import { Op } from 'sequelize';

export class FactoryAgentRepository extends BaseRepository<FactoryAgent> {
  constructor() {
    super(FactoryAgent);
  }

  async findByFactory(factoryId: string): Promise<FactoryAgent[]> {
    return this.model.findAll({
      where: { factory_id: factoryId },
      order: [['start_date', 'DESC']],
      include: [
        {
          model: User,
          as: 'agent',
          attributes: ['id', 'full_name', 'business_name', 'email', 'phone', 'status', 'role'],
          required: false,
        },
        {
          model: Document,
          as: 'contractDocument',
          attributes: ['id', 'file_secure_url', 'original_file_name', 'verification_status', 'reviewed_at'],
          required: false,
        },
      ],
    });
  }

  async findByAgent(agentId: string): Promise<FactoryAgent[]> {
    return this.model.findAll({
      where: { agent_id: agentId },
      order: [['start_date', 'DESC']],
      include: [
        {
          model: User,
          as: 'factory',
          attributes: ['id', 'full_name', 'business_name', 'email', 'phone', 'status', 'role'],
          required: false,
        },
        {
          model: Document,
          as: 'contractDocument',
          attributes: ['id', 'file_secure_url', 'original_file_name', 'verification_status', 'reviewed_at'],
          required: false,
        },
      ],
    });
  }

  async findActiveContracts(): Promise<FactoryAgent[]> {
    const currentDate = new Date();

    return this.model.findAll({
      where: {
        start_date: { [Op.lte]: currentDate },
        [Op.or]: [
          { end_date: null },
          { end_date: { [Op.gte]: currentDate } }
        ]
      },
      order: [['start_date', 'DESC']],
      include: [
        {
          model: User,
          as: 'factory',
          attributes: ['id', 'full_name', 'business_name', 'email', 'phone', 'status', 'role'],
          required: false,
        },
        {
          model: User,
          as: 'agent',
          attributes: ['id', 'full_name', 'business_name', 'email', 'phone', 'status', 'role'],
          required: false,
        },
      ],
    });
  }

  async findByContractNumber(contractNumber: string): Promise<FactoryAgent | null> {
    return this.model.findOne({
      where: { contract_number: contractNumber }
    });
  }

  async findExpiringContracts(daysAhead: number = 30): Promise<FactoryAgent[]> {
    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + daysAhead);

    return this.model.findAll({
      where: {
        end_date: {
          [Op.between]: [currentDate, futureDate]
        }
      },
      order: [['end_date', 'ASC']],
      include: [
        {
          model: User,
          as: 'factory',
          attributes: ['id', 'full_name', 'business_name', 'email', 'phone', 'status', 'role'],
          required: false,
        },
        {
          model: User,
          as: 'agent',
          attributes: ['id', 'full_name', 'business_name', 'email', 'phone', 'status', 'role'],
          required: false,
        },
      ],
    });
  }
}
