import { Schema, model } from 'mongoose';

const counterSchema = new Schema({
  _id: { type: String, required: true }, //identifies which counter we are maintaning
  seq: { type: Number, default: 0 }, //this stores the current sequence number,initial value is zero
//each time a new id is generated the sequence increases by one
});


const Counter = model('Counter', counterSchema);

//this function is responsible for generating the next sequence number
export async function getNextSequence(counterName: string): Promise<number> {
  const counter = await Counter.findOneAndUpdate(
    { _id: counterName },  //countername is the name like "Venue" ,looks for Id as venue
    { $inc: { seq: 1 } },//increment the sequence
    { new: true,  //return the updated document,so you get the incremented sequence number
      upsert: true } //if no matching counter exists,create one and apply the update
  );
  return counter!.seq; //retrun the sequence number
  // ! - is the typescript null assertion operator,
  //it tells typescript to treat counter as non-null. it does not perform a runtime null check
}


//this file is for updating the record with the venueId sequentially with the next next numbers consequetively
//this counter model maintains the last sequence number for each type of document
//