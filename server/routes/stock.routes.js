import express from 'express';
import { getStock, updateStock, getStockMoves } from '../controllers/stock.controller.js';

const router = express.Router();

router.get('/', getStock);
router.put('/update', updateStock);
router.get('/moves', getStockMoves);

export default router;
