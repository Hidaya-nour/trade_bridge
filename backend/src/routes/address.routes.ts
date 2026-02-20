import express from 'express';
import { AddressController } from '../controllers/address.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = express.Router();
const addrController = new AddressController();

router.use(authenticate);

router.post('/', validate(AddressController.createValidation), addrController.create);
router.get('/', addrController.getUserAddresses);
router.put('/:id', validate(AddressController.idValidation), addrController.update);
router.delete('/:id', validate(AddressController.idValidation), addrController.remove);

export default router;
