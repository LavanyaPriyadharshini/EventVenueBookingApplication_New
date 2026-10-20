import { createResourceApi } from '../lib/createResourceApi';

export interface Row {
  _id: string;
  sectionId: string;
  label: string;
  createdAt: string;
  updatedAt: string;
}

//here we are using the sectionid as the reference 
export type RowPayload = Pick<Row, 'sectionId' | 'label'>;

export const rowApi = createResourceApi<Row, RowPayload, Partial<RowPayload>>('/api/venues/rows', {
  create: 'createRow',
  getAll: 'getAllRows',
  getById: (id) => `getRowById/${id}`,
  update: (id) => `updateRowById/${id}`,
  remove: (id) => `deleteRowById/${id}`,
});

//next is the hooks -> useRows.ts
