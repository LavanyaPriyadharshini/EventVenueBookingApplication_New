import type { ReactNode } from 'react';

//here "T" represents the generic type parameter in ts
//T is a placeholder for a data type, it could represent venue, employee,event,or any other object type
//we use T becoz we dont know which data type the table will receive when defining the interface
interface Column<T> {
  header: string;
  accessor: (row: T) => ReactNode;
}

//if we have Venue, Employee etc, and when we use TableProps<Venue> ,then typescript replaces every "T" with the Venue
interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string; //keyExtractor: (row: T) => string — a function that receives one object and returns its unique key.
  emptyMessage?: string; //an optional message to display when there is no data. The ? means it is optional.
}

export function Table<T>
(
    { columns, data, keyExtractor, emptyMessage = 'No records found.' }: TableProps<T>
) 
{

 if(data.length === 0){
    return<p className='py-8 text-center text-sm text-gray-500'>{emptyMessage}</p>
 }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
      
        <thead className="bg-gray-50">
                  <tr>
             {columns.map((col) => (
              <th key={col.header} className="px-4 py-2 text-left font-medium text-gray-600">
                {col.header}
              </th>
            ))}          
          </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
          {data.map((row) => (
            <tr key={keyExtractor(row)}>
              {columns.map((col) => (
                <td key={col.header} className="px-4 py-2 text-gray-700">
                  {col.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
         </table>
    </div>

      );

      //next file is the Venues page - pages -> venues -> venues.tsx
}