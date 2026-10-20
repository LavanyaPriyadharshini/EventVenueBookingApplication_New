import { createResourceHooks } from './createResourceHooks';
import { seatApi, type Seat, type SeatPayload } from '../api/seat.api';



export const {
  useList: useSeats,
  useItem: useSeat,
  useCreate: useCreateSeat,
  useUpdate: useUpdateSeat,
  useRemove: useDeleteSeat,
} = createResourceHooks<Seat, SeatPayload>('seats', seatApi);

//next create a page for the Seats.tsx

