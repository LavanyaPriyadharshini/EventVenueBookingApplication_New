import { useState, type ChangeEvent, type FormEvent } from 'react';

//these are the common components created under the ui folder
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
//import { Table } from '../../components/ui/Table';

//this hooks page is linked to the "createResourcehooks" where the mutation,update and delete all queries gets executed there
// import { useVenues, useCreateVenue } from '../../hooks/useVenues';
import {  useCreateVenue } from '../../hooks/useVenues';


//import type { Venue, VenuePayload } from '../../api/venue.api';
import type {  VenuePayload } from '../../api/venue.api';

import { useNavigate } from 'react-router-dom';

//this is the properties where the values gets stored from the form
//venuepayload defines the properties that initialstate must contain
const initialState: VenuePayload = {
  name: '',
  address: '',
  city: '',
  country: '',
  landmark: '',
};

type FormErrors = Partial<Record<keyof VenuePayload, string>>;

const validate = (values: VenuePayload): FormErrors => {
  const errors: FormErrors = {};
  (Object.keys(values) as (keyof VenuePayload)[]).forEach((key) => {
    if (!values[key].trim()) errors[key] = 'This field is required';
  });
  return errors;
};


export const Venues = () => {

    const navigate=useNavigate();

  const [values, setValues] = useState<VenuePayload>(initialState); //the venue payload is given in the "venue.api.ts-this is linked"
  //the venue.api.ts is the file which contains the property structure

  const [errors, setErrors] = useState<FormErrors>({});
  //const { data, isLoading } = useVenues();
  const { mutate, isPending, isError, error } = useCreateVenue();

   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };


 const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    // mutate(values,
    //      { onSuccess: () => setValues(initialState) });

    mutate(values, {
  onSuccess: () => {
    setValues(initialState);
    navigate('/venuesdisplay'); //when registered the page gets redirected to the VenuessDisplay page
  },
});

  };

   return (

  <div className='mx-auto max-w-4xl px-4 py-10 sm:px-6'>
  <h1 className='text-xl font-semibold text-gray-900 sm: text-2xl'>Venues</h1>
  <p className='mt-1 text-sm text-gray-500'>Register a new venue and browse existing ones</p>
 
   <form
        className="mt-6 grid grid-cols-1 gap-4 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2"
        onSubmit={handleSubmit}
        noValidate //this novalidate is an html attribute that disables the browser's built-in form validation when the form is submitted
      >

{/* formfield is a separate file which contains the commong form field properties */}
        <FormField label="Name" name="name" value={values.name} onChange={handleChange} error={errors.name} />
        <FormField label="City" name="city" value={values.city} onChange={handleChange} error={errors.city} />


   <div className='sm:col-span-2'>

  <FormField
   label='Address'
   name="address"
   value={values.address}
   onChange={handleChange}
   error={errors.address}  
  />
  </div>

   <FormField
          label="Country"
          name="country"
          value={values.country}
          onChange={handleChange}
          error={errors.country}
        />


   <FormField
          label="Landmark"
          name="landmark"
          value={values.landmark}
          onChange={handleChange}
          error={errors.landmark}
        />

       {isError && (
          <p className="text-sm text-red-600 sm:col-span-2">
            {(error as any)?.response?.data?.message ?? 'Could not create venue.'}
          </p>
        )}

        <div className="sm:col-span-2">
          <Button type="submit" isLoading={isPending}>
            Create venue
          </Button>
        </div>

      </form>


{/* this code part i have added as a separate page in VenuesDisplay.tsx */}
{/* <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">All venues</h2>
        {isLoading ? (
          <p className="mt-4 text-sm text-gray-500">Loading venues…</p>
        ) : (
          <div className="mt-4">
            <Table<Venue>
              columns={[
                { header: 'ID', accessor: (v) => v.venueId },
                { header: 'Name', accessor: (v) => v.name },
                { header: 'City', accessor: (v) => v.city },
                { header: 'Country', accessor: (v) => v.country },
                { header: 'Landmark', accessor: (v) => v.landmark },
              ]}
              data={data?.data ?? []}
              keyExtractor={(v) => v._id}
              emptyMessage="No venues yet — create one above."
            />
          </div>
        )}
      </div> */}



    </div>

//after creating the template, wire the venues.tsx in the Dashboard.tsx
//then create VenueDisplay.tsx
//then like venue add the sections, rows ,seats pages
//create api->section.api.ts

   );
};