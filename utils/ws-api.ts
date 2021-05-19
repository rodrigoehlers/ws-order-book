export const getSubscriptionRequestPayload = (feedId: string, productIds: string | string[]) => {
  return { event: 'subscribe', feed: feedId, product_ids: Array.isArray(productIds) ? productIds : [productIds] };
};
