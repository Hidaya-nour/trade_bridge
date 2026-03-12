import express from 'express';
import { AddressController } from '../controllers/address.controller';
import { authenticateAllowPending } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = express.Router();
const addrController = new AddressController();

// Allow pending users to submit address during verification
router.use(authenticateAllowPending);

router.post('/', validate(AddressController.createValidation), addrController.create);
router.get('/', addrController.getUserAddresses);
router.put('/:id', validate(AddressController.idValidation), addrController.update);
router.delete('/:id', validate(AddressController.idValidation), addrController.remove);

export default router;
