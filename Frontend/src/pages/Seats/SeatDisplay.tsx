import { Link } from 'react-router-dom';
import { Table } from '../../components/ui/Table';
import { useSeats } from '../../hooks/useSeats';
import { useRows } from '../../hooks/useRowsHooks';
import type { Seat } from '../../api/seat.api';

export const SeatsDisplay = () => {

  const { data, isLoading } = useSeats();
  const { data: rowsData } = useRows();

  const rowLabelById = new Map(rowsData?.data.map((r) => [r._id, r.label]) ?? []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Seats</h1>
          <p className="mt-1 text-sm text-gray-500">All seats across your rows.</p>
        </div>
        <Link
          to="/seats/create"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Create seat
        </Link>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading seats…</p>
        ) : (
          <Table<Seat>
            columns={[
              { header: 'Seat number', accessor: (s) => s.number },
              { header: 'Row', accessor: (s) => rowLabelById.get(s.rowId) ?? s.rowId },
            ]}
            data={data?.data ?? []}
            keyExtractor={(s) => s._id}
            emptyMessage="No seats yet — create one to get started."
          />
        )}
      </div>
    </div>
  );
};


//now wire the rows, seats in the navbar -> layout -> navbar.tsx


