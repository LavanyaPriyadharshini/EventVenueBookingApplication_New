import { Link } from 'react-router-dom';
import { Table } from '../../components/ui/Table';
import { useSections } from '../../hooks/useSections';
import { useVenues } from '../../hooks/useVenues';
import type { Section } from '../../api/section.api';

export const SectionsDisplay = () => {

      const { data, isLoading } = useSections();
  const { data: venuesData } = useVenues();

  const venueNameById = new Map(venuesData?.data.map((v) => [v._id, v.name]) ?? []);

 return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Sections</h1>
          <p className="mt-1 text-sm text-gray-500">All sections across your venues.</p>
        </div>
        <Link
          to="/sections/create"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Create section
        </Link>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading sections…</p>
        ) : (
          <Table<Section>
            columns={[
              { header: 'Name', accessor: (s) => s.name },
              { header: 'Venue', accessor: (s) => venueNameById.get(s.venueId) ?? s.venueId },
            ]}
            data={data?.data ?? []}
            keyExtractor={(s) => s._id}
            emptyMessage="No sections yet — create one to get started."
          />
        )}
      </div>
    </div>
  );
};

//next create a navbar
// components -> layout -> navbar.tsx