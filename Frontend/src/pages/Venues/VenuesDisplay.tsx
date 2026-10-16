import { Link } from 'react-router-dom';
import { Table } from '../../components/ui/Table';
import { useVenues } from '../../hooks/useVenues';
import type { Venue } from '../../api/venue.api';

export const VenuesDisplay = () => {
const {data,isLoading} = useVenues();

return(
<div className='mx-auto max-w-4xl px-4 py-10 sm:px-6'>
 <div className='flex items-center justify-between'>
     <div>
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Venues</h1>
          <p className="mt-1 text-sm text-gray-500">View all registered venues.</p>
        </div>

      <Link
           to="/venues/create"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Create venue
        </Link>
         </div>

      <div className="mt-6">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading venues…</p>
        ) : (
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
            emptyMessage="No venues yet — create one to get started."
          />
        )}
      </div>
    </div>

)

}