import { Link } from 'react-router-dom';
import { Table } from '../../components/ui/Table';
import { useRows } from '../../hooks/useRowsHooks';
import { useSections } from '../../hooks/useSections';
import type { Row } from '../../api/row.api';

export const RowsDisplay = () => {

const{data,isLoading} = useRows();

const {data: sectionsData} =useSections(); //this refers to the usesectionshooks.ts -> which then referes to the createResourceHooks and 

const sectionNameById = new Map(sectionsData?.data.map((s) => [s._id, s.name]) ?? []);
//it maps and shows like. it maps the data fromt he sectiondata variable and stores the id and name in the sectionbynameid
// const sectionsData = {
//   data: [
//     { _id: "SEC001", name: "Venues" },
//     { _id: "SEC002", name: "Events" },
//     { _id: "SEC003", name: "Bookings" }
//   ]
// };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Rows</h1>
          <p className="mt-1 text-sm text-gray-500">All rows across your sections.</p>
        </div>
        <Link
          to="/rows/create"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Create row
        </Link>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading rows…</p>
        ) : (
          <Table<Row>
            columns={[
              { header: 'Label', accessor: (r) => r.label }, //accessor-it is a function that tells the table which value to display for a particular row
              //(r) -> represents the current row
              { header: 'Section', accessor: (r) => sectionNameById.get(r.sectionId) ?? r.sectionId },
            ]}

            //this passes the actual array of rows to the table.
            //data?.data- safely returns undefined if the outer data is null or undefined
            data={data?.data ?? []} //- ?? is the nullish coalescing operator ,- If the expression returns null or undefined, use an empty array.
            keyExtractor={(r) => r._id}//this tells the Table component how to identify each row uniquely
            emptyMessage="No rows yet — create one to get started."
          />
        )}
      </div>
    </div>
  );
};

//next create the Seat.api.ts

//  <Table<Row> - here table is a react component and Row is the typescript generic type argument, where it refers to the row structure that i have defined in the row.api.ts
//             columns={[
//               { header: 'Label', accessor: (r) => r.label },
//               { header: 'Section', accessor: (r) => sectionNameById.get(r.sectionId) ?? r.sectionId },
//             ]}
//             data={data?.data ?? []}
//             keyExtractor={(r) => r._id}
//             emptyMessage="No rows yet — create one to get started."
//           />

// / nullish coalescing operator- if the value on the left is null or undefined, use the value on the right 
//otherwise use the value on the left

// "|| operator" - this is called Logical OR operator - it returns the 1st truthy operand. or if neither operand is truthy, the las operand will be taken
//eg - const username = "";

// const result = username || "Guest";

// console.log(result);
//here the "" empty string is falsy so it takes the right value which is guest