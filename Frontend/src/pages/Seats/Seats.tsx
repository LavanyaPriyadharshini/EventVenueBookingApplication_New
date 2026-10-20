import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { useRows } from '../../hooks/useRowsHooks';
import { useCreateSeat } from '../../hooks/useSeats';

interface SeatFormState {
  rowId: string;
  number: string;
}

const initialState: SeatFormState = { rowId: '', number: '' };

type FormErrors = Partial<Record<keyof SeatFormState, string>>;

const validate = (values: SeatFormState): FormErrors => {
  const errors: FormErrors = {};
  if (!values.rowId) errors.rowId = 'Select a row';
  if (!values.number || Number(values.number) <= 0) errors.number = 'Enter a valid seat number';
  return errors;
};

export const Seats = () => {
  const [values, setValues] = useState<SeatFormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const { data: rowsData, isLoading: rowsLoading } = useRows();
  const { mutate, isPending, isError, error } = useCreateSeat();
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

    mutate(
      { rowId: values.rowId, number: Number(values.number) },
      { onSuccess: () => navigate('/seats') }
    );
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link to="/seats" className="text-sm text-indigo-600 hover:underline">
        ← Back to seats
      </Link>

      <h1 className="mt-2 text-xl font-semibold text-gray-900 sm:text-2xl">Create seat</h1>
      <p className="mt-1 text-sm text-gray-500">Add a seat to one of your rows.</p>

      <form
        className="mt-6 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="rowId" className="text-sm font-medium text-gray-700">
            Row
          </label>
          <select
            id="rowId"
            name="rowId"
            value={values.rowId}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">{rowsLoading ? 'Loading rows…' : 'Select a row'}</option>
            {rowsData?.data.map((row) => (
              <option key={row._id} value={row._id}>
                {row.label}
              </option>
            ))}
          </select>
          {errors.rowId && <p className="text-xs text-red-600">{errors.rowId}</p>}
        </div>

        <FormField
          label="Seat number"
          name="number"
          type="number"
          min={1}
          value={values.number}
          onChange={handleChange}
          error={errors.number}
        />

        {isError && (
          <p className="text-sm text-red-600">
            {(error as any)?.response?.data?.message ?? 'Could not create seat.'}
          </p>
        )}

        <Button type="submit" isLoading={isPending}>
          Create seat
        </Button>
      </form>
    </div>
  );
};