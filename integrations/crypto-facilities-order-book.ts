import {
  getSubscriptionCancelRequestPayload,
  getSubscriptionRequestPayload,
  Grouping,
  SortingDirection,
} from '../utils/ws-api';
import { handleNewEntries } from '../utils/crypto-facilities-order-book';
import { ConnectionStatus, StatusUpdateFunction, UpdateFunction, WebSocketOrderBook } from './web-socket-order-book';

export interface CryptoFacilitiesData {
  asks: RawAsks;
  bids: RawAsks;
}

export interface ParsedCryptoFacilitiesData {
  asks: Asks;
  bids: Bids;
}

export type RawEntry = [price: number, amount: number];
export type RawAsks = RawEntry[];
export type RawBids = RawEntry[];

export type Entry = [price: number, amount: number, total: number];
export type Asks = Entry[];
export type Bids = Entry[];

class CryptoFacilitiesOrderBook implements WebSocketOrderBook<CryptoFacilitiesData, ParsedCryptoFacilitiesData> {
  callbacks: UpdateFunction<ParsedCryptoFacilitiesData>[] = [];
  statusCallbacks: StatusUpdateFunction[] = [];

  connectionStatus: ConnectionStatus = 'initial';

  asks: Asks = [];
  bids: Bids = [];

  isSubscribed: boolean = false;

  endpoint: string;
  currentFeedId: string;
  productIds: string | string[];

  ws: WebSocket;

  constructor(endpoint: string, productIds: string | string[], grouping: Grouping = Grouping.POINT_FIVE) {
    this.open = this.open.bind(this);
    this.onWebSocketOpen = this.onWebSocketOpen.bind(this);
    this.onWebSocketMessage = this.onWebSocketMessage.bind(this);
    this.onWebSocketClose = this.onWebSocketClose.bind(this);
    this.onWebSocketError = this.onWebSocketError.bind(this);
    this.close = this.close.bind(this);

    this.onData = this.onData.bind(this);

    this.addUpdateListener = this.addUpdateListener.bind(this);
    this.removeUpdateListener = this.removeUpdateListener.bind(this);
    this.addStatusUpdateListener = this.addStatusUpdateListener.bind(this);
    this.removeStatusUpdateListener = this.removeStatusUpdateListener.bind(this);
    this.updateListeners = this.updateListeners.bind(this);
    this.updateStatusListeners = this.updateStatusListeners.bind(this);

    this.endpoint = endpoint;
    this.currentFeedId = `book_ui_${grouping}`;
    this.productIds = productIds;

    this.open();
  }

  private onWebSocketOpen() {
    this.connectionStatus = 'live';
    this.updateStatusListeners();
    console.log('Websocket is now open.');
  }

  private onWebSocketError(event: ErrorEvent) {
    this.connectionStatus = 'error';
    this.updateStatusListeners();
    console.error('WebSocket encountered an error.', event);
  }

  private onWebSocketClose() {
    if (this.connectionStatus !== 'error') {
      this.connectionStatus = 'connecting';
      this.updateStatusListeners();
    }
    console.log('Websocket is now closed.');
  }

  private onWebSocketMessage(event: MessageEvent) {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch (error) {
      this.connectionStatus = 'error';
      console.error('Parsing data failed.', error);
      return;
    }

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
          this.onData(data as CryptoFacilitiesData);
          break;
        case `${this.currentFeedId}_snapshot`:
          // TODO: Is this reset really necessary?
          this.asks = [];
          this.bids = [];
          this.onData(data as CryptoFacilitiesData);
          break;
      }
    }
  }

  onData(data: CryptoFacilitiesData) {
    const { asks, bids } = data;
    this.asks = handleNewEntries(this.asks, asks, SortingDirection.ASKS);
    this.bids = handleNewEntries(this.bids, bids, SortingDirection.BIDS);
    this.updateListeners();
  }

  addUpdateListener(callback: UpdateFunction<ParsedCryptoFacilitiesData>) {
    this.callbacks = [...this.callbacks, callback];
    return () => this.removeUpdateListener(callback);
  }

  removeUpdateListener(callback: UpdateFunction<ParsedCryptoFacilitiesData>): void {
    const index = this.callbacks.findIndex((item) => item === callback);
    if (index !== -1) {
      this.callbacks.splice(index, 1);
    }
  }

  private updateListeners() {
    this.callbacks.forEach((callback) => {
      callback({ asks: this.asks, bids: this.bids });
    });
  }

  open() {
    const rs = this.ws?.readyState;
    if (!rs || rs === 2 || rs === 3) {
      this.ws = new WebSocket(`wss://${this.endpoint}`);
      this.ws.onopen = this.onWebSocketOpen;
      this.ws.onmessage = this.onWebSocketMessage;
      this.ws.onerror = this.onWebSocketError;
      this.ws.onclose = this.onWebSocketClose;
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

  addStatusUpdateListener(callback: StatusUpdateFunction): Function {
    this.statusCallbacks = [...this.statusCallbacks, callback];
    return () => this.removeStatusUpdateListener(callback);
  }

  removeStatusUpdateListener(callback: StatusUpdateFunction): void {
    const index = this.statusCallbacks.findIndex((item) => item === callback);
    if (index !== -1) {
      this.statusCallbacks.splice(index, 1);
    }
  }

  private updateStatusListeners() {
    this.statusCallbacks.forEach((callback) => {
      callback(this.connectionStatus);
    });
  }
}

export default CryptoFacilitiesOrderBook;
