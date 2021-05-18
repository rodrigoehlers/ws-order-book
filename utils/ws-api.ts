export const getSubscriptionRequestPayloadForProductIds = (productIds: string | string[]) => {
  return { event: 'subscribe', feed: 'book_ui_1', product_ids: Array.isArray(productIds) ? productIds : [productIds] };
};
