import {
  getSubscriptionCancelRequestPayload,
  getSubscriptionRequestPayload,
  Grouping,
  SortingDirection,
} from '../utils/ws-api';
import { handleNewEntries, transformRawEntriesToEntries } from '../utils/order-book';

export type UpdateFunction = (bids: Bids, asks: Asks) => void;

export interface OrderBook {
  ws: WebSocket;
  callbacks: UpdateFunction[];
  asks: Asks;
  bids: Bids;
  open();
  addUpdateListener(callback: UpdateFunction): Function;
  removeUpdateListener(callback: UpdateFunction);
  updateGrouping(grouping: Grouping);
  close();
}

type Snapshot = {
  asks: RawAsks;
  bids: RawAsks;
};

type Delta = {
  asks: RawAsks;
  bids: RawBids;
};

export type RawEntry = [number, number];
export type RawAsks = RawEntry[];
export type RawBids = RawEntry[];

export type Entry = [number, number, number];
export type Asks = Entry[];
export type Bids = Entry[];

class CryptoFacilitiesOrderBook implements OrderBook {
  endpoint: string;
  currentFeedId: string;
  productIds: string | string[];

  callbacks: UpdateFunction[];
  asks: Asks;
  bids: Bids;

  isSubscribed: boolean;
  ws: WebSocket;

  constructor(endpoint: string, productIds: string | string[], grouping: Grouping = Grouping.POINT_FIVE) {
    this.open = this.open.bind(this);
    this.onWebSocketMessage = this.onWebSocketMessage.bind(this);
    this.close = this.close.bind(this);

    this.onSnapshot = this.onSnapshot.bind(this);
    this.onDelta = this.onDelta.bind(this);

    this.addUpdateListener = this.addUpdateListener.bind(this);
    this.removeUpdateListener = this.removeUpdateListener.bind(this);
    this.updateListeners = this.updateListeners.bind(this);

    this.callbacks = [];
    this.isSubscribed = false;

    this.asks = [];
    this.bids = [];

    this.endpoint = endpoint;
    this.currentFeedId = `book_ui_${grouping}`;
    this.productIds = productIds;

    this.open();
  }

  private static onWebSocketOpen() {
    console.log('WebSocket is now open.');
  }

  private static onWebSocketError(event: ErrorEvent) {
    console.error('WebSocket encountered an error.', event);
  }

  private static onWebSocketClose() {
    console.log('Websocket is now closed.');
  }

  private onWebSocketMessage(event: MessageEvent) {
    // TODO: Error handling for corrupt data.
    const data = JSON.parse(event.data);

    const isEvent = data.event;
    if (isEvent) {
      switch (data.event) {
        case 'info':
          if (!this.isSubscribed) {
            const requestPayload = getSubscriptionRequestPayload(this.currentFeedId, this.productIds);
            this.ws.send(JSON.stringify(requestPayload));
          }
          break;
        case 'subscribed':
          this.isSubscribed = true;
          console.log('WebSocket is subscribed.');
          break;
        case 'unsubscribed':
          this.isSubscribed = false;
          console.log('WebSocket is unsubscribed.');
          break;
      }
    } else {
      switch (data.feed) {
        case this.currentFeedId:
          this.onDelta(data as Delta);
          break;
        case `${this.currentFeedId}_snapshot`:
          this.onSnapshot(data as Snapshot);
          break;
      }
    }
  }

  private onSnapshot(snapshot: Snapshot) {
    this.asks = transformRawEntriesToEntries(snapshot.asks, SortingDirection.ASKS);
    this.bids = transformRawEntriesToEntries(snapshot.bids, SortingDirection.BIDS);
    this.updateListeners();
  }

  private onDelta(delta: Delta) {
    const { bids, asks } = delta;

    this.bids = handleNewEntries(this.bids, bids, SortingDirection.BIDS);
    this.asks = handleNewEntries(this.asks, asks, SortingDirection.ASKS);

    this.updateListeners();
  }

  private updateListeners() {
    this.callbacks.forEach((callback) => {
      callback(this.bids, this.asks);
    });
  }

  addUpdateListener(callback: UpdateFunction) {
    this.callbacks = [...this.callbacks, callback];
    return () => this.removeUpdateListener(callback);
  }

  removeUpdateListener(callback: UpdateFunction) {
    const index = this.callbacks.findIndex((item) => item === callback);
    if (index === -1) return;

    this.callbacks.splice(index, 1);
  }

  open() {
    const rs = this.ws?.readyState;
    if (!rs || rs === 2 || rs === 3) {
      this.ws = new WebSocket(`wss://${this.endpoint}`);
      this.ws.onopen = CryptoFacilitiesOrderBook.onWebSocketOpen;
      this.ws.onmessage = this.onWebSocketMessage;
      this.ws.onerror = CryptoFacilitiesOrderBook.onWebSocketError;
      this.ws.onclose = CryptoFacilitiesOrderBook.onWebSocketClose;
    }
  }

  updateGrouping(grouping: Grouping) {
    const cancelPayload = getSubscriptionCancelRequestPayload(this.currentFeedId, this.productIds);
    this.ws.send(JSON.stringify(cancelPayload));

    this.currentFeedId = `book_ui_${grouping}`;

    const nextSubscriptionPayload = getSubscriptionRequestPayload(this.currentFeedId, this.productIds);
    this.ws.send(JSON.stringify(nextSubscriptionPayload));
  }

  close() {
    const rs = this.ws?.readyState;
    if (rs === 0 || rs === 1) {
      const cancelPayload = getSubscriptionCancelRequestPayload(this.currentFeedId, this.productIds);
      this.ws.send(JSON.stringify(cancelPayload));

      this.isSubscribed = false;

      this.ws.close();
    }
  }
}

export default CryptoFacilitiesOrderBook;
