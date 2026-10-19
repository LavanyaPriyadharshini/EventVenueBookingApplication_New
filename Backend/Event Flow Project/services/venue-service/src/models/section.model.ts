import { Schema, model, Types } from 'mongoose';

const sectionSchema = new Schema(
  {
    venueId: { type: Types.ObjectId, ref: 'Venue', required: true },
    //here in mongo db the reference to the Venue collection is giving the ref in this model
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const Section = model('VenueSection', sectionSchema);


//venueId is how Mongo represents the relationship — not a SQL foreign key, 
// just an ObjectId pointing at a Venue document. ref: 'Venue' is what lets 
// Mongoose .populate('venueId') later if you ever want the full venue object instead of just its id