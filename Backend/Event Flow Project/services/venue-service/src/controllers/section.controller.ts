import { asyncHandler, AppError, MongooseRepository } from '@eventflow/shared';
import { Section } from '../models/section.model';

export const sectionRepo = new MongooseRepository(Section);

export const createSection = asyncHandler(async (req, res) => {
  const section = await sectionRepo.create(req.body);
  res.status(201).json({ status: 'success', data: section });
});

export const getAllSections = asyncHandler(async (req, res) => {
  const sections = await sectionRepo.findAll(req.query);
  res.status(200).json({ status: 'success', results: sections.length, data: sections });
});

export const getSectionById = asyncHandler(async (req, res, next) => {
  const section = await sectionRepo.findById(req.params.id);
  if (!section) return next(new AppError('No section found with that ID', 404));
  res.status(200).json({ status: 'success', data: section });
});

export const updateSectionById = asyncHandler(async (req, res, next) => {
  const section = await sectionRepo.updateById(req.params.id, req.body);
  if (!section) return next(new AppError('No section found with that ID', 404));
  res.status(200).json({ status: 'success', data: section });
});

export const deleteSectionById = asyncHandler(async (req, res, next) => {
  const section = await sectionRepo.deleteById(req.params.id);
  if (!section) return next(new AppError('No section found with that ID', 404));
  res.status(204).json({ status: 'success', data: null });
});
