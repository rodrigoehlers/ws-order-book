export enum Grouping {
  POINT_FIVE = '1',
  ONE = '2',
  TWO_POINT_FIVE = '5',
  FIVE = '10',
  TEN = '20',
  TWENTY_FIVE = '50',
  FIFTY = '100',
  ONE_HUNDRED = '200',
  TWO_HUNDRED_AND_FIFTY = '500',
  FIVE_HUNDRED = '1000',
  ONE_THOUSAND = '2000',
  TWO_THOUSAND_FIVE_HUNDRED = '5000',
}

export enum SortingDirection {
  BIDS = 'desc',
  ASKS = 'asc',
}

export const getSubscriptionRequestPayload = (feedId: string, productIds: string | string[]) => {
  return { event: 'subscribe', feed: feedId, product_ids: Array.isArray(productIds) ? productIds : [productIds] };
};

export const getSubscriptionCancelRequestPayload = (feedId: string, productIds: string | string[]) => {
  return { event: 'unsubscribe', feed: feedId, product_ids: Array.isArray(productIds) ? productIds : [productIds] };
};
