/**
 * Takes multiple strings and joins with a space.
 * @param items Any amount of items to join with a space.
 *
 * @returns joinedItems All items joined with a space.
 */
export const joinWithSpace = (...items: string[]): string => items.filter(Boolean).join(' ');
