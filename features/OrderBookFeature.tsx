import { useEffect, useRef, useState } from 'react';
import CryptoFacilitiesOrderBook, { Asks, Bids, OrderBook, UpdateFunction } from '../integrations/order-book';

const WSS_ENDPOINT = process.env.NEXT_PUBLIC_WSS_ENDPOINT;

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
    const orderBook = new CryptoFacilitiesOrderBook(WSS_ENDPOINT);
    orderBookRef.current = orderBook;

    const remove = orderBook.addUpdateListener(updateBidsAndAsks);

    return () => {
      remove();
      orderBook.close();
    };
  }, []);

  return (
    <div className="container mx-auto">
      <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">WS Order Book</h2>
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
