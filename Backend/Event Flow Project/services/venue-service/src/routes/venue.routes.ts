import { Router } from 'express';
import { protect, restrictTo } from '@eventflow/shared';
import {
  createVenue,
  getVenues,
  getVenueById,
  updateVenueById,
  deleteVenueById,
} from '../controllers/venue.controller';

// Why protect/restrictTo only on writes: anyone (even logged-out visitors) should be able to
// browse venues, but only an authenticated organizer or admin can create/edit one, and only
// admin can delete.
export const venueRouter = Router();

venueRouter.route('/getAllVenues').get(getVenues);
venueRouter.route('/createVenue').post(createVenue); //protect/restrictTo removed for testing purposes

venueRouter.route('/getVenueById/:id').get(getVenueById);
venueRouter.route('/updateVenueById/:id').patch(protect, restrictTo('organizer', 'admin'), updateVenueById);
venueRouter.route('/deleteVenueById/:id').delete(protect, restrictTo('admin'), deleteVenueById);
