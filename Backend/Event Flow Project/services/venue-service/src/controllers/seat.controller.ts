import { asyncHandler, AppError, MongooseRepository } from '@eventflow/shared';
import { Seat } from '../models/seat.model';

export const seatRepo = new MongooseRepository(Seat);

export const createSeat = asyncHandler(async (req, res) => {
  const seat = await seatRepo.create(req.body);
  res.status(201).json({ status: 'success', data: seat });
});

export const getAllSeats = asyncHandler(async (req, res) => {
  const seats = await seatRepo.findAll(req.query);
  res.status(200).json({ status: 'success', results: seats.length, data: seats });
});

export const getSeatById = asyncHandler(async (req, res, next) => {
  const seat = await seatRepo.findById(req.params.id);
  if (!seat) return next(new AppError('No seat found with that ID', 404));
  res.status(200).json({ status: 'success', data: seat });
});

export const updateSeatById = asyncHandler(async (req, res, next) => {
  const seat = await seatRepo.updateById(req.params.id, req.body);
  if (!seat) return next(new AppError('No seat found with that ID', 404));
  res.status(200).json({ status: 'success', data: seat });
});

export const deleteSeatById = asyncHandler(async (req, res, next) => {
  const seat = await seatRepo.deleteById(req.params.id);
  if (!seat) return next(new AppError('No seat found with that ID', 404));
  res.status(204).json({ status: 'success', data: null });
});
