import React, { ReactNode } from 'react';
import { Entry } from '../integrations/crypto-facilities-order-book';

export interface EntryTableProps extends React.HTMLAttributes<HTMLDivElement> {
  entries: Entry[];
  renderEntry(entry: Entry, index: number): ReactNode;
}

const EntryTable = (props: EntryTableProps) => {
  const { entries, renderEntry, ...rest } = props;
  return (
    <div {...rest}>
      <div className="py-2 px-2">
        <div className="shadow sm:rounded-lg">
          <table className="w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="w-1/3 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="w-1/3 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="w-1/3 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody>{entries.map(renderEntry)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EntryTable;
