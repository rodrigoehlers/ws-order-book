import { ChangeEvent, useEffect, useRef, useState } from 'react';
import CryptoFacilitiesOrderBook, { Asks, Bids, OrderBook, UpdateFunction } from '../integrations/order-book';
import { Grouping } from '../utils/ws-api';

const WSS_ENDPOINT = process.env.NEXT_PUBLIC_WSS_ENDPOINT;
const PRODUCT_IDS_RAW = process.env.NEXT_PUBLIC_PRODUCT_IDS;
const PRODUCT_IDS = PRODUCT_IDS_RAW.split(',');

const OrderBookFeature = () => {
  const orderBookRef = useRef<OrderBook>();

  const [bids, setBids] = useState<Bids>([]);
  const [asks, setAsks] = useState<Asks>([]);

  const updateBidsAndAsks: UpdateFunction = (bids, asks) => {
    setBids([...bids]);
    setAsks([...asks]);
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

  const handleGroupingChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { target } = event;
    const grouping = target.value as Grouping;
    orderBookRef.current.updateGrouping(grouping);
  };

  return (
    <div className="container mx-auto">
      <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">WS Order Book</h2>
      <select onChange={handleGroupingChange}>
        {Object.entries(Grouping).map(([name, value]) => {
          return (
            <option key={name} value={value}>
              {name}
            </option>
          );
        })}
      </select>
      <div className="flex">
        <ul>
          {bids.map((bid) => {
            return (
              <li key={bid[0]}>
                {bid[0]} - {bid[1]}
              </li>
            );
          })}
        </ul>
        <ul>
          {asks.map((ask) => {
            return (
              <li key={ask[0]}>
                {ask[0]} - {ask[1]}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default OrderBookFeature;
