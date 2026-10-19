import { Schema, model } from 'mongoose';
import { getNextSequence } from './counter.model';

const venueSchema = new Schema(
  {
    venueId: { type: String, unique: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    landmark:{ type: String, required: true },
  },
  { timestamps: true }
);

//pre('save') is the mongoose middleware,also called a pre save hook
//it runs before a document is saved or created

venueSchema.pre('save', async function (next) {
  if (this.isNew) { //this refers to the venue document being saved.
    //this.isnew is true when mongoose considers the document new and not yet saved

    const seq = await getNextSequence('venue');
    this.venueId = `VEN${String(seq).padStart(3, '0')}`;
// .padStart(3, '0') adds zeros to the beginning until the string is at least three characters long.

  }
  next();
});

export const Venue = model('Venue', venueSchema);


