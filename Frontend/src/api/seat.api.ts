import { createResourceApi } from '../lib/createResourceApi';

export interface Seat {
  _id: string;
  rowId: string;
  number: number;
  createdAt: string;
  updatedAt: string;
}

//the order follows like 
//1. venue registration 2. Section 3. ros 4. seat
//this refers to the Row id
export type SeatPayload = Pick<Seat, 'rowId' | 'number'>;


export const seatApi = createResourceApi<Seat, SeatPayload, Partial<SeatPayload>>('/api/venues/seats', {
  create: 'createSeat',
  getAll: 'getAllSeats',
  getById: (id) => `getSeatById/${id}`,
  update: (id) => `updateSeatById/${id}`,
  remove: (id) => `deleteSeatById/${id}`,
});

//next is the useSeats.ts hooks