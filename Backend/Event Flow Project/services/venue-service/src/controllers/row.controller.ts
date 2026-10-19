import { asyncHandler, AppError, MongooseRepository } from '@eventflow/shared';
import { Row } from '../models/row.model';

export const rowRepo = new MongooseRepository(Row);

export const createRow = asyncHandler(async (req, res) => {
  const row = await rowRepo.create(req.body);
  res.status(201).json({ status: 'success', data: row });
});

export const getAllRows = asyncHandler(async (req, res) => {
  const rows = await rowRepo.findAll(req.query);
  res.status(200).json({ status: 'success', results: rows.length, data: rows });
});

export const getRowById = asyncHandler(async (req, res, next) => {
  const row = await rowRepo.findById(req.params.id);
  if (!row) return next(new AppError('No row found with that ID', 404));
  res.status(200).json({ status: 'success', data: row });
});

export const updateRowById = asyncHandler(async (req, res, next) => {
  const row = await rowRepo.updateById(req.params.id, req.body);
  if (!row) return next(new AppError('No row found with that ID', 404));
  res.status(200).json({ status: 'success', data: row });
});

export const deleteRowById = asyncHandler(async (req, res, next) => {
  const row = await rowRepo.deleteById(req.params.id);
  if (!row) return next(new AppError('No row found with that ID', 404));
  res.status(204).json({ status: 'success', data: null });
});
