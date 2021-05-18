import { useEffect, useRef } from 'react';
import { getSubscriptionRequestPayloadForProductIds } from '../utils/ws-api';

const WSS_ENDPOINT = process.env.NEXT_PUBLIC_WSS_ENDPOINT;

const OrderBookFeature = () => {
  const wsRef = useRef<WebSocket>();

  useEffect(() => {
    // TODO: Handle `WSS_ENDPOINT` not defined.
    const ws = new WebSocket(`wss://${WSS_ENDPOINT}`);
    const requestPayload = getSubscriptionRequestPayloadForProductIds('PI_XBTUSD');

    // TODO: Send the subscription message after receiving the first `info` event.
    ws.onopen = () => {
      ws.send(JSON.stringify(requestPayload));
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="container mx-auto">
      <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">WS Order Book</h2>
    </div>
  );
};

export default OrderBookFeature;

// wss://
