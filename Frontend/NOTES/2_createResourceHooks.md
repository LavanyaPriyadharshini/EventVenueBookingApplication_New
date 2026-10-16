interface ResourceApi<TItem, TCreatePayload, TUpdatePayload> {
  getAll: (params?: Record<string, unknown>) => Promise<{ status: string; results: number; data: TItem[] }>;
  getById: (id: string) => Promise<{ status: string; data: TItem }>;
  create: (payload: TCreatePayload) => Promise<{ status: string; data: TItem }>;
  update: (id: string, payload: TUpdatePayload) => Promise<{ status: string; data: TItem }>;
  remove: (id: string) => Promise<void>;
}

This interface defines the standard operations that every resource API should provide.
-TItem — the type of data returned, such as an Employee or Venue.- this is used for get operations
TCreatePayload — the data required to create a record.- this is used for creating the payload
-TUpdatePayload — the data required to update a record.- this is used for updating


1. querykey - this identifies the resource in react query's cache

2. api- the actual api methods used to communicate with the backend


