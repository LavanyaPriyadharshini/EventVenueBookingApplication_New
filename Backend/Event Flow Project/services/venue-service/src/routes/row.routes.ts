import { Router } from 'express';
import {
  createRow,
  getAllRows,
  getRowById,
  updateRowById,
  deleteRowById,
} from '../controllers/row.controller';

export const rowRouter = Router();

rowRouter.route('/createRow').post(createRow);
rowRouter.route('/getAllRows').get(getAllRows);
rowRouter.route('/getRowById/:id').get(getRowById);
rowRouter.route('/updateRowById/:id').patch(updateRowById);
rowRouter.route('/deleteRowById/:id').delete(deleteRowById);
