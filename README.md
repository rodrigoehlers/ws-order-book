# ws-order-book

Realtime order book using a WebSocket.

## Getting Started

To run `ws-order-book` locally you need to clone the repository and install the dependencies using `npm i`.
The application depends on two environment variables `NEXT_PUBLIC_WSS_ENDPOINT` and `NEXT_PUBLIC_PRODUCT_IDS`. Either pass them when starting the application with `npm run dev` or create a `.env` file containing the environment variables.

An example of a valid `.env` file:

```
NEXT_PUBLIC_WSS_ENDPOINT=www.cryptofacilities.com/ws/v1
NEXT_PUBLIC_PRODUCT_IDS`=PI_XBTUSD
```

The environment variable `NEXT_PUBLIC_WSS_ENDPOINT` should contain the WebSocket host. Not the full url with the protocol, just the host. The application prepends `wss://` automatically.

The environment variable `NEXT_PUBLIC_PRODUCT_IDS` should contain comma-separated product ids, although the application currently only supports a maximum of one.

After you ran the command to start the application, wait a few seconds and open [http://localhost:3000](http://localhost:3000) with a browser of your choice.