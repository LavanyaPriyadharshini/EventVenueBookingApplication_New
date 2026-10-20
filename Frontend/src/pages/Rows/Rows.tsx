import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { useSections } from '../../hooks/useSections';
import { useCreateRow } from '../../hooks/useRowsHooks';
import type { RowPayload } from '../../api/row.api'; //it is given in the row.api.ts


//the structure of this code follows the same pattern as that of the venue,section etc
const initialState: RowPayload = { sectionId: '', label: '' };

type FormErrors = Partial<Record<keyof RowPayload, string>>;

const validate = (values: RowPayload): FormErrors => {
  const errors: FormErrors = {};
  if (!values.sectionId) errors.sectionId = 'Select a section';
  if (!values.label.trim()) errors.label = 'Row label is required';
  return errors;
};

export const Rows = () => {
  
  const [values, setValues] = useState<RowPayload>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const { data: sectionsData, isLoading: sectionsLoading } = useSections();
  const { mutate, isPending, isError, error } = useCreateRow();
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

    mutate(values, { onSuccess: () => navigate('/rows') });
  };



   return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link to="/rows" className="text-sm text-indigo-600 hover:underline">
        ← Back to rows
      </Link>

      <h1 className="mt-2 text-xl font-semibold text-gray-900 sm:text-2xl">Create row</h1>
      <p className="mt-1 text-sm text-gray-500">Add a row to one of your sections.</p>

      <form
        className="mt-6 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="sectionId" className="text-sm font-medium text-gray-700">
            Section
          </label>
          <select
            id="sectionId"
            name="sectionId"
            value={values.sectionId}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">{sectionsLoading ? 'Loading sections…' : 'Select a section'}</option>
            {sectionsData?.data.map((section) => (
              <option key={section._id} value={section._id}>
                {section.name}
              </option>
            ))}
          </select>
          {errors.sectionId && <p className="text-xs text-red-600">{errors.sectionId}</p>}
        </div>

        <FormField
          label="Row label"
          name="label"
          value={values.label}
          onChange={handleChange}
          error={errors.label}
        />

        {isError && (
          <p className="text-sm text-red-600">
            {(error as any)?.response?.data?.message ?? 'Could not create row.'}
          </p>
        )}

        <Button type="submit" isLoading={isPending}>
          Create row
        </Button>
      </form>
    </div>
  );

};

//next is the RowDisplay.tsx
