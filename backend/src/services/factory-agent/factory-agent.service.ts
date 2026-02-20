import { FactoryAgentRepository } from '../../repositories/factory-agent.repository';
import { AppError } from '../../utils/errors';
import { IFactoryAgent, CreateFactoryAgentDTO, UpdateFactoryAgentDTO } from '../../types/factory-agent.types';
import logger from '../../utils/logger';

export class FactoryAgentService {
  private factoryAgentRepo = new FactoryAgentRepository();

  async createFactoryAgent(data: CreateFactoryAgentDTO, createdBy: string): Promise<IFactoryAgent> {
    if (!data.factory_id || !data.agent_id || !data.contract_number ||
        !data.contract_type || !data.commission_rate || !data.commission_type ||
        !data.start_date || !data.payment_terms) {
      throw new AppError('Missing required fields', 400);
    }

    // Check if contract number already exists
    const existingContract = await this.factoryAgentRepo.findByContractNumber(data.contract_number);
    if (existingContract) {
      throw new AppError('Contract number already exists', 400);
    }

    const factoryAgentData = {
      ...data,
      created_by: createdBy
    };

    const factoryAgent = await this.factoryAgentRepo.create(factoryAgentData as any);
    logger.info(`Factory agent contract created: ${data.contract_number}`);
    return factoryAgent as IFactoryAgent;
  }

  async getFactoryAgents(factoryId: string): Promise<IFactoryAgent[]> {
    return this.factoryAgentRepo.findByFactory(factoryId) as Promise<IFactoryAgent[]>;
  }

  async getAgentContracts(agentId: string): Promise<IFactoryAgent[]> {
    return this.factoryAgentRepo.findByAgent(agentId) as Promise<IFactoryAgent[]>;
  }

  async getActiveContracts(): Promise<IFactoryAgent[]> {
    return this.factoryAgentRepo.findActiveContracts() as Promise<IFactoryAgent[]>;
  }

  async getExpiringContracts(daysAhead: number = 30): Promise<IFactoryAgent[]> {
    return this.factoryAgentRepo.findExpiringContracts(daysAhead) as Promise<IFactoryAgent[]>;
  }

  async updateFactoryAgent(id: string, data: UpdateFactoryAgentDTO): Promise<[number, IFactoryAgent[]]> {
    const updated = await this.factoryAgentRepo.update(id, data as any);
    logger.info(`Factory agent contract ${id} updated`);
    return updated as [number, IFactoryAgent[]];
  }

  async deleteFactoryAgent(id: string): Promise<number> {
    const contract = await this.factoryAgentRepo.findById(id);
    if (!contract) {
      throw new AppError('Factory agent contract not found', 404);
    }

    const deleted = await this.factoryAgentRepo.delete(id);
    logger.info(`Factory agent contract ${id} deleted`);
    return deleted;
  }

  async terminateContract(id: string, terminationReason: string): Promise<[number, IFactoryAgent[]]> {
    const data = {
      end_date: new Date(),
      termination_reason: terminationReason
    };

    const updated = await this.factoryAgentRepo.update(id, data as any);
    logger.info(`Factory agent contract ${id} terminated`);
    return updated as [number, IFactoryAgent[]];
  }

  async updateLastSaleDate(id: string): Promise<[number, IFactoryAgent[]]> {
    const data = {
      last_sale_date: new Date()
    };

    const updated = await this.factoryAgentRepo.update(id, data as any);
    logger.info(`Last sale date updated for contract ${id}`);
    return updated as [number, IFactoryAgent[]];
  }
}