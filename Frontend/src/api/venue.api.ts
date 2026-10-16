import { createResourceApi } from '../lib/createResourceApi';

//this is specific only for the Venue service

export interface Venue {
  _id: string;
  venueId: string;
  name: string;
  address: string;
  city: string;
  country: string;
  landmark: string;
  createdAt: string;
  updatedAt: string;
}

//angle brackets are used for a typescript utility type called "pick",the venue interface contains all the values
//but when we want to use selective properties or fields from the venue interface we use "pick"
//Pick allows you to select only the properties you need.
export type VenuePayload = Pick<Venue, 'name' | 'address' | 'city' | 'country' | 'landmark'>;

// '/api/venues' is the gateway prefix; the rest matches venue-service's actual route names.
//all these endpoints are coming from the createResourceApi.tsx - which is commonly created
export const venueApi = createResourceApi<Venue, VenuePayload, Partial<VenuePayload>>('/api/venues', {
  create: 'createVenue',
  getAll: 'getAllVenues',
  getById: (id) => `getVenueById/${id}`,
  update: (id) => `updateVenueById/${id}`,
  remove: (id) => `deleteVenueById/${id}`,
});

//next is the hooks - useVenues.ts