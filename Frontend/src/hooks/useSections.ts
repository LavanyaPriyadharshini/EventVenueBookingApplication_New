import { createResourceHooks } from './createResourceHooks';
import { sectionApi, type Section, type SectionPayload } from '../api/section.api';


export const {
  useList: useSections,
  useItem: useSection,
  useCreate: useCreateSection,
  useUpdate: useUpdateSection,
  useRemove: useDeleteSection,
} = createResourceHooks<Section, SectionPayload>('sections', sectionApi);