import { ChangeEvent, useEffect, useRef, useState } from 'react';
import CryptoFacilitiesOrderBook, { OrderBook, UpdateFunction, Bids, Asks } from '../integrations/order-book';
import { Grouping } from '../utils/ws-api';
import EntryTable from '../components/EntryTable';
import Select from '../components/Select';
import { Listbox } from '@headlessui/react';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid';
import { getReadableNumber } from '../utils/intl';

const WSS_ENDPOINT = process.env.NEXT_PUBLIC_WSS_ENDPOINT;
const PRODUCT_IDS_RAW = process.env.NEXT_PUBLIC_PRODUCT_IDS;
const PRODUCT_IDS = PRODUCT_IDS_RAW.split(',');

type Option = { name: number; value: Grouping };

const options: Option[] = [
  { name: 0.5, value: Grouping.POINT_FIVE },
  { name: 1, value: Grouping.ONE },
  { name: 2.5, value: Grouping.TWO_POINT_FIVE },
  { name: 5, value: Grouping.FIVE },
  { name: 10, value: Grouping.TEN },
  { name: 25, value: Grouping.TWENTY_FIVE },
  { name: 50, value: Grouping.FIFTY },
  { name: 100, value: Grouping.ONE_HUNDRED },
  { name: 250, value: Grouping.TWO_HUNDRED_AND_FIFTY },
  { name: 500, value: Grouping.FIVE_HUNDRED },
  { name: 1000, value: Grouping.ONE_THOUSAND },
  { name: 2500, value: Grouping.TWO_THOUSAND_FIVE_HUNDRED },
];

const OrderBookFeature = () => {
  const orderBookRef = useRef<OrderBook>();

  const [option, setOption] = useState<Option>(options[9]);
  const [bids, setBids] = useState<Bids>([]);
  const [asks, setAsks] = useState<Asks>([]);

  const updateBidsAndAsks: UpdateFunction = (bids, asks) => {
    setBids([...bids.slice(0, 7)]);
    setAsks([...asks.slice(0, 7)]);
  };

  useEffect(() => {
    // TODO: Handle `WSS_ENDPOINT` not defined.
    const orderBook = new CryptoFacilitiesOrderBook(WSS_ENDPOINT, PRODUCT_IDS);
    orderBookRef.current = orderBook;

    const remove = orderBook.addUpdateListener(updateBidsAndAsks);

    return () => {
      remove();
      orderBook.close();
    };
  }, []);

  useEffect(() => {
    if (orderBookRef.current) {
      const handleVisibilityChange = () => {
        const { current: orderBook } = orderBookRef;
        if (document.hidden) {
          orderBook.close();
        } else {
          orderBook.open();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [orderBookRef]);

  const handleOptionChange = (option: Option) => {
    setOption(option);
    orderBookRef.current.updateGrouping(option.value);
  };

  return (
    <div className="container mx-auto">
      <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">WS Order Book</h2>

      <div className="flex items-center space-x-4">
        <div>Grouping</div>
        <Select<Option>
          className="relative mt-1 mb-2 w-1/5"
          options={options}
          value={option}
          onOptionChange={handleOptionChange}
          renderButtonContent={(value) => (
            <>
              <span className="block truncate">{getReadableNumber(value.name)}</span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <SelectorIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
              </span>
            </>
          )}
          renderOption={(option) => (
            <Listbox.Option
              key={option.value}
              className={({ active }) =>
                `${active ? 'text-blue-900 bg-blue-100' : 'text-gray-900'}
                          cursor-default select-none relative py-2 pl-10 pr-4`
              }
              value={option}
            >
              {({ selected, active }) => (
                <>
                  <span className={`${selected ? 'font-medium' : 'font-normal'} block truncate`}>
                    {getReadableNumber(option.name)}
                  </span>
                  {selected ? (
                    <span
                      className={`${active ? 'text-blue-600' : 'text-blue-600'}
                                absolute inset-y-0 left-0 flex items-center pl-3`}
                    >
                      <CheckIcon className="w-5 h-5" aria-hidden="true" />
                    </span>
                  ) : null}
                </>
              )}
            </Listbox.Option>
          )}
        />
      </div>

      <div className="flex space-x-4">
        <div>
          <h3 className="font-bold leading-7 text-gray-900">Bids</h3>
          <EntryTable entries={bids} />
        </div>
        <div>
          <h3 className="font-bold leading-7 text-gray-900">Asks</h3>
          <EntryTable entries={asks} />
        </div>
      </div>
    </div>
  );
};

export default OrderBookFeature;
