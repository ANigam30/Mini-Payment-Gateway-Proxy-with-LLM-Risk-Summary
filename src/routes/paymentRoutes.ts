import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';

const router = Router();
const paymentController = new PaymentController();

// POST /charge
router.post('/', paymentController.processPayment);

export default router; 