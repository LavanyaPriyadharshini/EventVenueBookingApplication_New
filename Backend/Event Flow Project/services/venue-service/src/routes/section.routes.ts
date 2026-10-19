import { Router } from 'express';
import {
  createSection,
  getAllSections,
  getSectionById,
  updateSectionById,
  deleteSectionById,
} from '../controllers/section.controller';

export const sectionRouter = Router();

sectionRouter.route('/createSection').post(createSection);
sectionRouter.route('/getAllSections').get(getAllSections);
sectionRouter.route('/getSectionById/:id').get(getSectionById);
sectionRouter.route('/updateSectionById/:id').patch(updateSectionById);
sectionRouter.route('/deleteSectionById/:id').delete(deleteSectionById);
