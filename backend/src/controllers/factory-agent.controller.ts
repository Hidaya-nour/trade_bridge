import { Request, Response } from 'express';
import { FactoryAgentService } from '../services/factory-agent/factory-agent.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { body, param } from 'express-validator';

const factoryAgentService = new FactoryAgentService();

export class FactoryAgentController {
  async create(req: Request, res: Response) {
    try {
      const createdBy = (req as any).user.id;
      const role = (req as any).user.role as string | undefined;
      const data = { ...(req.body || {}) };

      // Security: factories can only create contracts for themselves.
      if (role === 'factory') {
        data.factory_id = createdBy;
      }

      const factoryAgent = await factoryAgentService.createFactoryAgent(data, createdBy);
      res.status(201).json({ success: true, data: factoryAgent });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Create factory agent error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getFactoryAgents(req: Request, res: Response) {
    try {
      const factoryId = (req as any).user.id;
      const agents = await factoryAgentService.getFactoryAgents(factoryId);
      res.json({ success: true, data: agents });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get factory agents error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getAgentContracts(req: Request, res: Response) {
    try {
      const agentId = (req as any).user.id;
      const contracts = await factoryAgentService.getAgentContracts(agentId);
      res.json({ success: true, data: contracts });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get agent contracts error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getActiveContracts(_req: Request, res: Response) {
    try {
      const contracts = await factoryAgentService.getActiveContracts();
      res.json({ success: true, data: contracts });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get active contracts error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getExpiringContracts(req: Request, res: Response) {
    try {
      const daysAhead = parseInt(req.query.days as string) || 30;
      const contracts = await factoryAgentService.getExpiringContracts(daysAhead);
      res.json({ success: true, data: contracts });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get expiring contracts error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getAvailableAgents(req: Request, res: Response) {
    try {
      const search = String(req.query.search || '').trim();
      const agents = await factoryAgentService.getAvailableAgents(search || undefined);
      res.json({ success: true, data: agents });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get available agents error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      await factoryAgentService.updateFactoryAgent(id, data);
      res.json({ success: true, message: 'Factory agent contract updated' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Update factory agent error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async terminate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { termination_reason } = req.body;

      if (!termination_reason) {
        res.status(400).json({ success: false, message: 'Termination reason is required' });
        return;
      }

      await factoryAgentService.terminateContract(id, termination_reason);
      res.json({ success: true, message: 'Contract terminated' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Terminate contract error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async updateLastSale(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await factoryAgentService.updateLastSaleDate(id);
      res.json({ success: true, message: 'Last sale date updated' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Update last sale error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await factoryAgentService.deleteFactoryAgent(id);
      res.json({ success: true, message: 'Factory agent contract deleted' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Delete factory agent error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  static createValidation = [
    body('factory_id').optional().isUUID(),
    body('agent_id').isUUID(),
    body('contract_number').isString().notEmpty(),
    body('contract_document_id').optional().isUUID(),
    body('contract_document_url').isString().notEmpty(),
    body('contract_document_name').optional().isString().isLength({ max: 255 }),
    body('contract_type').isIn(['exclusive', 'non_exclusive', 'temporary', 'permanent']),
    body('commission_rate').isFloat({ min: 0 }),
    body('commission_type').isIn(['percentage', 'fixed_amount', 'tiered']),
    body('min_sales_target').optional().isFloat({ min: 0 }),
    body('max_sales_cap').optional().isFloat({ min: 0 }),
    body('territory').optional().isString(),
    body('start_date').isISO8601(),
    body('end_date').optional().isISO8601(),
    body('renewal_date').optional().isISO8601(),
    body('payment_terms').isIn(['monthly', 'quarterly', 'annually', 'upon_sale'])
  ];

  static idValidation = [param('id').isUUID().withMessage('Invalid factory agent ID')];
}
