//Refer notes for this file - 

import { axiosClient } from './axiosClients'; //used to send the http requests to the backend api

interface ResourceEndpoints {
  create: string;
  getAll: string;
  getById: (id: string) => string;
  update: (id: string) => string;
  remove: (id: string) => string;
}

// Mirrors shared/crudFactory.ts on the backend — one generic function instead of
// hand-writing getAll/getById/create/update/remove axios calls for every domain.
export function createResourceApi<
TItem, //type of resource retruned by the API ,eg a venue object or properties
TCreatePayload = Partial<TItem>, //tcreatepayload- this is the Data required to create a resource
 TUpdatePayload = Partial<TItem>//The data sent when updating an existing resource.
>

(
  basePath: string, //basePath: a common path associated with the resource, such as '/venues'.
  endpoints: ResourceEndpoints //endpoints: the actual endpoint configuration, including paths for creating, retrieving, updating, and deleting resources
) 

{

      return {
   //from here the api gateway endpoint is called
        getAll: async (params?: Record<string, unknown>) => {
            //here in the axiosclient.ts the baseurl is specified
      const { data } = await axiosClient.get<{ status: string; results: number; data: TItem[] }>(
        `${basePath}/${endpoints.getAll}`,
        { params } //Axios recognizes the params property and converts its values into URL query parameters.
      );
      return data; //it is the body retruned by the backend
    },
    //GET /api/venues?page=1&limit=10&search=Chennai - these are query parameters not a request body


    getById: async (id: string) => {
      const { data } = await axiosClient.get<{ status: string; data: TItem }>(
        `${basePath}/${endpoints.getById(id)}`
      );
      return data;
    },


  create: async (payload: TCreatePayload) => {
      const { data } = await axiosClient.post<{ status: string; data: TItem }>(
        `${basePath}/${endpoints.create}`,
        payload
      );
      return data;
    },

  update: async (id: string, payload: TUpdatePayload) => {
      const { data } = await axiosClient.patch<{ status: string; data: TItem }>(
        `${basePath}/${endpoints.update(id)}`,
        payload
      );
      return data;
    },


    remove: async (id: string) => {
      await axiosClient.delete(`${basePath}/${endpoints.remove(id)}`);
    },

  };


  //next is the "CreateReqourceHooks.ts under the Hooks folder"
}