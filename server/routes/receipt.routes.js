import express from 'express';
import { getReceipts, createReceipt, getReceiptById, validateReceipt } from '../controllers/receipt.controller.js';

const router = express.Router();

router.get('/', getReceipts);
router.post('/', createReceipt);
router.get('/:id', getReceiptById);
router.put('/:id/validate', validateReceipt);

export default router;
