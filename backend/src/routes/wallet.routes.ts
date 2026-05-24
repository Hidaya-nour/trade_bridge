import { Router } from 'express';
import { body, param } from 'express-validator';
import walletController from '../controllers/wallet.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticate);

router.get('/balance', (req, res) => walletController.getBalance(req, res));

router.post(
  '/settle/order/:orderId',
  validate([param('orderId').isUUID().withMessage('Valid orderId is required')]),
  (req, res) => walletController.settleOrder(req, res),
);

router.post(
  '/withdraw',
  validate([
    body('amount')
      .isFloat({ min: Number(process.env.MIN_WITHDRAWAL_AMOUNT || 10000) })
      .withMessage(
        `amount must be at least ETB ${Number(process.env.MIN_WITHDRAWAL_AMOUNT || 10000)}`,
      ),
    body('bank_provider').optional().isString(),
    body('bank_account_name').optional().isString(),
    body('bank_account_number').optional().isString(),
  ]),
  (req, res) => walletController.requestWithdrawal(req, res),
);

router.get('/withdrawals', (req, res) => walletController.listMyWithdrawals(req, res));

router.get('/withdrawals/pending', (req, res) =>
  walletController.listPendingWithdrawals(req, res),
);

router.patch(
  '/withdrawals/:id/approve',
  validate([param('id').isUUID().withMessage('Valid withdrawal id is required')]),
  (req, res) => walletController.approveWithdrawal(req, res),
);

router.patch(
  '/withdrawals/:id/reject',
  validate([param('id').isUUID().withMessage('Valid withdrawal id is required')]),
  (req, res) => walletController.rejectWithdrawal(req, res),
);

export default router;
