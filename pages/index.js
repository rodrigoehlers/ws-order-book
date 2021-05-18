import Head from 'next/head';
import OrderBookFeature from '../features/OrderBookFeature';

const Main = () => {
  return (
    <>
      <Head>
        <title>WS Order Book</title>
        <meta name="description" content="Realtime order book using a WebSocket." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <OrderBookFeature />
    </>
  );
};

export default Main;
