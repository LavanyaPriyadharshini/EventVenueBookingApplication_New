import { Router } from 'express';
import {
  createSeat,
  getAllSeats,
  getSeatById,
  updateSeatById,
  deleteSeatById,
} from '../controllers/seat.controller';

export const seatRouter = Router();

seatRouter.route('/createSeat').post(createSeat);
seatRouter.route('/getAllSeats').get(getAllSeats);
seatRouter.route('/getSeatById/:id').get(getSeatById);
seatRouter.route('/updateSeatById/:id').patch(updateSeatById);
seatRouter.route('/deleteSeatById/:id').delete(deleteSeatById);
