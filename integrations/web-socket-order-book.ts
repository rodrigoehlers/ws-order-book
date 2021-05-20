import { Grouping } from '../utils/ws-api';

export type ConnectionStatus = 'initial' | 'connecting' | 'live' | 'error';
export type StatusUpdateFunction = (status: ConnectionStatus) => void;
export type UpdateFunction<Data> = (data: Data) => void;

export interface WebSocketOrderBook<IncomingData, ParsedData> {
  ws: WebSocket;
  callbacks: UpdateFunction<ParsedData>[];
  open();
  onData(data: IncomingData);
  close();

  addUpdateListener(callback: UpdateFunction<ParsedData>): Function;
  removeUpdateListener(callback: UpdateFunction<ParsedData>): void;

  addStatusUpdateListener(callback: StatusUpdateFunction): Function;
  removeStatusUpdateListener(callback: StatusUpdateFunction): void;

  updateGrouping(grouping: Grouping);
}
