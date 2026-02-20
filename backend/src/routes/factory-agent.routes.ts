import express from 'express';
import { FactoryAgentController } from '../controllers/factory-agent.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = express.Router();
const factoryAgentController = new FactoryAgentController();

// All routes require authentication
router.use(authenticate);

// Factory agent routes
router.post('/', authorize('factory', 'admin'), validate(FactoryAgentController.createValidation), factoryAgentController.create);

// Factory-specific routes
router.get('/factory', authorize('factory', 'admin'), factoryAgentController.getFactoryAgents);

// Agent-specific routes
router.get('/agent', authorize('distributor', 'admin'), factoryAgentController.getAgentContracts);

// Admin-only routes
router.get('/active', authorize('admin'), factoryAgentController.getActiveContracts);
router.get('/expiring', authorize('admin'), factoryAgentController.getExpiringContracts);

// General CRUD operations (with appropriate authorization)
router.put('/:id', authorize('factory', 'admin'), validate(FactoryAgentController.idValidation), factoryAgentController.update);
router.patch('/:id/terminate', authorize('factory', 'admin'), validate(FactoryAgentController.idValidation), factoryAgentController.terminate);
router.patch('/:id/last-sale', authorize('factory', 'admin'), validate(FactoryAgentController.idValidation), factoryAgentController.updateLastSale);
router.delete('/:id', authorize('admin'), validate(FactoryAgentController.idValidation), factoryAgentController.remove);

export default router;