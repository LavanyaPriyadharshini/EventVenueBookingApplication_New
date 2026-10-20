import { createResourceHooks } from './createResourceHooks';
import { rowApi, type Row, type RowPayload } from '../api/row.api';

export const {
  useList: useRows,
  useItem: useRow,
  useCreate: useCreateRow,
  useUpdate: useUpdateRow,
  useRemove: useDeleteRow,
} = createResourceHooks<Row, RowPayload>('rows', rowApi);

