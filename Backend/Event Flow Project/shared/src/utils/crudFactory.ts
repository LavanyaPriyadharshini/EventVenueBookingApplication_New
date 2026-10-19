import { IRepository } from '../interfaces/IRepository';
import { AppError } from './AppError';
import { asyncHandler } from './asyncHandler';

// A CRUD Factory is a reusable function that generates the common API handlers for
// Create, Read, Update, and Delete operations, so you don't have to write the same code
// repeatedly for every MongoDB model.
//it is like a generic crud utility
//we can reuse in the code like "CreateOne(user);"

// Every function here takes an IRepository<T>, never a Mongoose Model directly — that's the
// Dependency Inversion fix. This file has no idea Mongoose exists.

export const createOne = <T>(repo: IRepository<T>) =>
  asyncHandler(async (req, res) => {
    const doc = await repo.create(req.body);
    res.status(201).json({ status: 'success', data: doc });
  });

export const getAll = <T>(repo: IRepository<T>) =>
  asyncHandler(async (req, res) => {
    const docs = await repo.findAll(req.query);
    res.status(200).json({ status: 'success', results: docs.length, data: docs });
  });

export const getOne = <T>(repo: IRepository<T>) =>
  asyncHandler(async (req, res, next) => {
    const doc = await repo.findById(req.params.id);
    if (!doc) return next(new AppError('No document found with that ID', 404));
    res.status(200).json({ status: 'success', data: doc });
  });

export const updateOne = <T>(repo: IRepository<T>) =>
  asyncHandler(async (req, res, next) => {
    const doc = await repo.updateById(req.params.id, req.body);
    if (!doc) return next(new AppError('No document found with that ID', 404));
    res.status(200).json({ status: 'success', data: doc });
  });

export const deleteOne = <T>(repo: IRepository<T>) =>
  asyncHandler(async (req, res, next) => {
    const doc = await repo.deleteById(req.params.id);
    if (!doc) return next(new AppError('No document found with that ID', 404));
    res.status(204).json({ status: 'success', data: null });
  });
