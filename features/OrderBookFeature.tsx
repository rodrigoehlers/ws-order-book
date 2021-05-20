import React, { useEffect, useRef, useState } from 'react';
import { ConnectionStatus, WebSocketOrderBook } from '../integrations/web-socket-order-book';

import CryptoFacilitiesOrderBook, {
  CryptoFacilitiesData,
  ParsedCryptoFacilitiesData,
} from '../integrations/crypto-facilities-order-book';
import { Grouping } from '../utils/ws-api';
import EntryTable from '../components/EntryTable';
import ControlsFeature from './ControlsFeature';
import { getReadableNumber, getReadableNumberAsCurrency } from '../utils/intl';
import StatusHeader, { StatusHeaderProps } from '../components/StatusHeader';

const WSS_ENDPOINT = process.env.NEXT_PUBLIC_WSS_ENDPOINT;
const PRODUCT_IDS_RAW = process.env.NEXT_PUBLIC_PRODUCT_IDS;
const PRODUCT_IDS = PRODUCT_IDS_RAW.split(',');

export type GroupingOption = { name: number; value: Grouping };

const options: GroupingOption[] = [
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
  const orderBookRef = useRef<WebSocketOrderBook<CryptoFacilitiesData, ParsedCryptoFacilitiesData>>();

  const [groupingIndex, setGroupingIndex] = useState<number>(9);

  const handleGroupingIndexDecrease = () => {
    const nextIndex = groupingIndex <= 0 ? 0 : groupingIndex - 1;
    setGroupingIndex(nextIndex);
    orderBookRef.current.updateGrouping(options[nextIndex].value);
  };

  const handleGroupingIndexIncrease = () => {
    const nextIndex = groupingIndex >= options.length - 1 ? options.length - 1 : groupingIndex + 1;
    setGroupingIndex(nextIndex);
    orderBookRef.current.updateGrouping(options[nextIndex].value);
  };

  const [data, setData] = useState<ParsedCryptoFacilitiesData>({ asks: [], bids: [] });
  const [status, setStatus] = useState<ConnectionStatus>('initial');

  useEffect(() => {
    // TODO: Handle `WSS_ENDPOINT` not defined.
    const orderBook = new CryptoFacilitiesOrderBook(WSS_ENDPOINT, PRODUCT_IDS, options[groupingIndex].value);
    orderBookRef.current = orderBook;

    const removeUpdateListener = orderBook.addUpdateListener(setData);
    const removeStatusUpdateListener = orderBook.addStatusUpdateListener(setStatus);

    return () => {
      removeUpdateListener();
      removeStatusUpdateListener();
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

  // StatusHeader
  const isInitialOrConnecting = status === 'initial' || status === 'connecting';
  const isLive = status === 'live';
  const statusHeaderLabel: string = isInitialOrConnecting
    ? 'Establishing connection...'
    : isLive
    ? 'Live'
    : 'An error occured, try reloading the page.';
  const statusHeaderLevel: StatusHeaderProps['level'] = isInitialOrConnecting ? 'warn' : isLive ? 'success' : 'error';

  // Bids and Asks
  const bids = data.bids.slice(0, 7);
  const asks = data.asks.slice(0, 7);

  return (
    <>
      <StatusHeader label={statusHeaderLabel} level={statusHeaderLevel} pulse={isInitialOrConnecting || isLive} />
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex flex-col items-center space-y-2">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">WS Order Book</h2>
          <p className="text-gray-700">Realtime order book using a WebSocket.</p>
        </div>
        <ControlsFeature
          className="sm:hidden block"
          groupingOption={options[groupingIndex]}
          isDecreasePossible={groupingIndex >= 1}
          onDecrease={handleGroupingIndexDecrease}
          isIncreasePossible={groupingIndex <= options.length - 2}
          onIncrease={handleGroupingIndexIncrease}
        />

        <div className="flex flex-col sm:flex-row justify-center items-center sm:space-x-4 sm:space-y-0 space-y-4">
          <div className="flex flex-col items-center 2xl:w-1/4 lg:w-2/5 sm:w-1/2 w-11/12 space-y-2">
            <h3 className="sm:text-2xl font-bold leading-7 text-gray-900">Asks</h3>
            <EntryTable
              renderEntry={([id, amount, total], index) => {
                return (
                  <tr key={id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                      {getReadableNumberAsCurrency(id)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{getReadableNumber(amount)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{getReadableNumber(total)}</td>
                  </tr>
                );
              }}
              entries={asks}
            />
          </div>
          <div className="flex flex-col items-center 2xl:w-1/4 lg:w-2/5 sm:w-1/2 w-11/12 space-y-2">
            <h3 className="sm:text-2xl text-xl font-bold leading-7 text-gray-900">Bids</h3>
            <EntryTable
              renderEntry={([id, amount, total], index) => {
                return (
                  <tr key={id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-red-600">
                      {getReadableNumberAsCurrency(id)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{getReadableNumber(amount)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{getReadableNumber(total)}</td>
                  </tr>
                );
              }}
              entries={bids}
            />
          </div>
        </div>
        <ControlsFeature
          className="sm:block hidden"
          groupingOption={options[groupingIndex]}
          isDecreasePossible={groupingIndex >= 1}
          onDecrease={handleGroupingIndexDecrease}
          isIncreasePossible={groupingIndex <= options.length - 2}
          onIncrease={handleGroupingIndexIncrease}
        />
      </div>
    </>
  );
};

export default OrderBookFeature;
