import express from 'express';
import { getDeliveries, createDelivery, getDeliveryById, validateDelivery, updateDeliveryStatus } from '../controllers/delivery.controller.js';

const router = express.Router();

router.get('/', getDeliveries);
router.post('/', createDelivery);
router.get('/:id', getDeliveryById);
router.put('/:id/status', updateDeliveryStatus);
router.put('/:id/validate', validateDelivery);

export default router;
