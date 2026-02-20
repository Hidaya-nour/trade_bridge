import { BaseRepository } from './base.repository';
import FactoryAgent from '../models/factory-agent.model';
import { Op } from 'sequelize';

export class FactoryAgentRepository extends BaseRepository<FactoryAgent> {
  constructor() {
    super(FactoryAgent);
  }

  async findByFactory(factoryId: string): Promise<FactoryAgent[]> {
    return this.model.findAll({
      where: { factory_id: factoryId },
      order: [['start_date', 'DESC']]
    });
  }

  async findByAgent(agentId: string): Promise<FactoryAgent[]> {
    return this.model.findAll({
      where: { agent_id: agentId },
      order: [['start_date', 'DESC']]
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
      order: [['start_date', 'DESC']]
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
      order: [['end_date', 'ASC']]
    });
  }
}