import { createResourceApi } from '../lib/createResourceApi';

//same like venue.api.ts

export interface Section {
      _id: string;
  venueId: string; //this comes as a reference to the venue table or collection
  name: string;
  createdAt: string;
  updatedAt: string;
}

export type SectionPayload = Pick<Section,'venueId' | 'name'>;

export const sectionApi =createResourceApi<Section,SectionPayload,Partial<SectionPayload>>(
      '/api/venues/sections',
      {
        create: 'createSection',
    getAll: 'getAllSections',
    getById: (id) => `getSectionById/${id}`,
    update: (id) => `updateSectionById/${id}`,
    remove: (id) => `deleteSectionById/${id}`,
      }
)

//next go to the hooks-usesections.ts