import express from 'express';
import { getStock, updateStock, getStockMoves, transferStock } from '../controllers/stock.controller.js';

const router = express.Router();

router.get('/', getStock);
router.put('/update', updateStock);
router.get('/moves', getStockMoves);
router.post('/transfer', transferStock);

export default router;
