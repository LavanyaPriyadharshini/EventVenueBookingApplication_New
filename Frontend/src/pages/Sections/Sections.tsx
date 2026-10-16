import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { useVenues } from '../../hooks/useVenues';
import { useCreateSection } from '../../hooks/useSections';
import type { SectionPayload } from '../../api/section.api';

const initialState: SectionPayload = { venueId: '', name: '' };

type FormErrors = Partial<Record<keyof SectionPayload, string>>;

const validate = (values: SectionPayload): FormErrors => {
  const errors: FormErrors = {};
  if (!values.venueId) errors.venueId = 'Select a venue';
  if (!values.name.trim()) errors.name = 'Section name is required';
  return errors;
};


export const Sections = () => {
  const [values, setValues] = useState<SectionPayload>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const { data: venuesData, isLoading: venuesLoading } = useVenues();
  const { mutate, isPending, isError, error } = useCreateSection();
  const navigate = useNavigate();

   const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };


    const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    mutate(values, { onSuccess: () => navigate('/sections') });
  };


    return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link to="/sections" className="text-sm text-indigo-600 hover:underline">
        ← Back to sections
      </Link>

      <h1 className="mt-2 text-xl font-semibold text-gray-900 sm:text-2xl">Create section</h1>
      <p className="mt-1 text-sm text-gray-500">Add a section to one of your venues.</p>

      <form
        className="mt-6 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="venueId" className="text-sm font-medium text-gray-700">
            Venue
          </label>
          <select
            id="venueId"
            name="venueId"
            value={values.venueId}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">{venuesLoading ? 'Loading venues…' : 'Select a venue'}</option>
            {venuesData?.data.map((venue) => (
              <option key={venue._id} value={venue._id}>
                {venue.name} ({venue.venueId})
              </option>
            ))}
          </select>
          {errors.venueId && <p className="text-xs text-red-600">{errors.venueId}</p>}
        </div>

        <FormField
          label="Section name"
          name="name"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
        />

        {isError && (
          <p className="text-sm text-red-600">
            {(error as any)?.response?.data?.message ?? 'Could not create section.'}
          </p>
        )}

        <Button type="submit" isLoading={isPending}>
          Create section
        </Button>
      </form>
    </div>
  );
};