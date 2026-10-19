import { Schema, model, Types } from 'mongoose';

const rowSchema = new Schema(
  {
    sectionId: { type: Types.ObjectId, ref: 'VenueSection', required: true },
    label: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const Row = model('Venue_Row', rowSchema);
