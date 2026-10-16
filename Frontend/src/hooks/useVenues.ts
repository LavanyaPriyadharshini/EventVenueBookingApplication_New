import { createResourceHooks } from './createResourceHooks';
import { venueApi, type Venue, type VenuePayload } from '../api/venue.api';

export const {
  useList: useVenues,
  useItem: useVenue,
  useCreate: useCreateVenue,
  useUpdate: useUpdateVenue,
  useRemove: useDeleteVenue,
} = createResourceHooks<Venue, VenuePayload>('venues', venueApi);

//create a reusable table for the all the files under the components- > ui -> table.tsx
//here the uselist and the useitem etc are the variables that has been coded in the "CreateResourcehooks"  
//there the mutation functions,edit, update and everything takes place 
//it is common to all

