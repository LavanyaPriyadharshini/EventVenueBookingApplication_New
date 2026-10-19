import { asyncHandler, AppError, MongooseRepository } from '@eventflow/shared';
import { Venue } from '../models/venue.model';

//in the mongooserepository file we have given all the crud operations method names
export const venueRepo = new MongooseRepository(Venue);

export const createVenue=asyncHandler(async(req,res) => {
    const venue = await venueRepo.create(req.body);
    res.status(201).json({
        status:'success',
        data:venue
    });
})


//instead of retriving all the records at a time , we are filtering it by pagination

export const getVenues = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1); //req.query.page- reads the page number supplied by the url in the frontend

  //limit - controls how many venue documents the API returns in one request
  const limit = Math.min(
    100, //ensures the result is atmost 100
    Math.max(1, Number(req.query.limit) || 20) //defaults to 20
  );
//Why set a maximum of 100? To prevent clients from requesting
//  excessively large pages and putting unnecessary pressure on your server.


const skip = (page - 1) * limit; //MongoDB needs to know how many documents to skip before returning the requested page.
//for eg- if we want page 2 , it tells to skip first 20 and retrun the next 20

//this is where the actual db query happens
  const venues = await Venue.find()
//   .sort({
//     createdAt: -1 //descending order : newest first
//   })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: 'success',
    page,
    limit,
    results: venues.length,
    data: venues,
  });
});


export const getVenueById = asyncHandler(async (req, res, next) => {
  const venue = await venueRepo.findById(req.params.id);
  if (!venue) return next(new AppError('No venue found with that ID', 404));
  res.status(200).json({ status: 'success', data: venue });
});

export const updateVenueById = asyncHandler(async (req, res, next) => {
  const venue = await venueRepo.updateById(req.params.id, req.body);
  if (!venue) return next(new AppError('No venue found with that ID', 404));
  res.status(200).json({ status: 'success', data: venue });
});

export const deleteVenueById = asyncHandler(async (req, res, next) => {
  const venue = await venueRepo.deleteById(req.params.id);
  if (!venue) return next(new AppError('No venue found with that ID', 404));
  res.status(204).json({ status: 'success', data: null });
});
