import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

//this hook is used as a "common Reusable logic"
//Without this approach, you might write similar query hooks separately for every resource.
// An interface defines a contract. It specifies which methods an API service 
// must provide, what arguments those methods accept, and what they return.
interface ResourceApi<TItem, TCreatePayload, TUpdatePayload> {
  getAll: (params?: Record<string, unknown>) => Promise<{ status: string; results: number; data: TItem[] }>;
  getById: (id: string) => Promise<{ status: string; data: TItem }>;
  create: (payload: TCreatePayload) => Promise<{ status: string; data: TItem }>;
  update: (id: string, payload: TUpdatePayload) => Promise<{ status: string; data: TItem }>;
  remove: (id: string) => Promise<void>;
}

// One generic hook-set, reused for every domain instead of a useVenues/useSections/useRows
// each reimplementing the same useQuery/useMutation + cache-invalidation boilerplate.
//common hooks for all the services and component files
export function createResourceHooks<TItem, TCreatePayload = Partial<TItem>, TUpdatePayload = Partial<TItem>>(
  queryKey: string,
  api: ResourceApi<TItem, TCreatePayload, TUpdatePayload>
) {

    //fetches a list of records
    const useList = (params?: Record<string, unknown>) =>
    useQuery({
      queryKey: [queryKey, 'list', params], //query key -uniquely identifies the query and its parameters in the cache
      queryFn: () => api.getAll(params),//queryFn calls the API to fetch the list.
    });


    const useItem = (id: string) =>
    useQuery({
      queryKey: [queryKey, 'item', id],
      queryFn: () => api.getById(id),
      enabled: !!id,
    });


    const useCreate = () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (payload: TCreatePayload) => api.create(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey, 'list'] }),
      });
    };


    const useUpdate = () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: TUpdatePayload }) => api.update(id, payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey, 'list'] }),
      });
    };

    const useRemove = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => api.remove(id),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey, 'list'] }),
    });
  };

    return { useList, useItem, useCreate, useUpdate, useRemove };

//next is the Venue.api.ts under the api folder -exclusive for the venue
}