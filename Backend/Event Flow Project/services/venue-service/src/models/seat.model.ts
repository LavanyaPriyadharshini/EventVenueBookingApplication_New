import { Schema, model, Types } from 'mongoose';

const seatSchema = new Schema(
  {
    rowId: { type: Types.ObjectId, ref: 'Venue_Row', required: true },
    number: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Seat = model('Venue_Seat', seatSchema);
