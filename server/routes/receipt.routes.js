import express from 'express';
import { getReceipts, createReceipt, getReceiptById, validateReceipt, updateReceiptStatus } from '../controllers/receipt.controller.js';

const router = express.Router();

router.get('/', getReceipts);
router.post('/', createReceipt);
router.get('/:id', getReceiptById);
router.put('/:id/status', updateReceiptStatus);
router.put('/:id/validate', validateReceipt);

export default router;
