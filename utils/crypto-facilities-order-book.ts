import { Entry, RawEntry } from '../integrations/crypto-facilities-order-book';
import { SortingDirection } from './ws-api';

export const updateEntryTotalsFromLastCorrectIndex = (entries: Entry[], lastCorrectIndex: number = -1): Entry[] => {
  // No need to update if the last correct index already is the last/first item.
  if (lastCorrectIndex === entries.length - 1) {
    return entries;
  }

  // Retrieve the real last correct total or 0.
  const [, , lastCorrectTotal] = entries[lastCorrectIndex] ?? [0, 0, 0];
  let currentTotal = lastCorrectTotal;

  // A `lastCorrectIndex` of 0/length of entries means we should redo the whole thing.
  const startingPoint = Math.max(lastCorrectIndex + 1, 0);

  let updatedEntries: Entry[] = entries.slice(0, startingPoint);

  for (let i = startingPoint; i < entries.length; i += 1) {
    const current = entries[i];

    const [id, amount] = current;
    currentTotal += amount;

    const currentWithTotal: Entry = [id, amount, currentTotal];

    updatedEntries = [...updatedEntries, currentWithTotal];
  }

  return updatedEntries;
};

/**
 * Handles adding/updating a single rawEntry into/in an existing array of entries.
 *
 * @param entries Existing array of entries.
 * @param rawEntry New or updated rawEntry to add into/update the existing array of entries (with).
 * @param direction Direction the array is sorting in to correctly insert the item if needed.
 * @private
 *
 * @returns entries Updated array of entries.
 */
export const handleNewEntry = (
  entries: Entry[],
  rawEntry: RawEntry,
  direction: SortingDirection
): [Entry[], number | undefined] => {
  let clone = [...entries];
  // Needed for deletion and insertion.
  const [id, amount] = rawEntry;

  const existingIndex = clone.findIndex((item) => item[0] === id);

  const shouldDelete = existingIndex !== -1 && amount === 0;
  if (shouldDelete) {
    clone.splice(existingIndex, 1);
    return [clone, existingIndex - 1];
  }

  const shouldUpdate = existingIndex !== -1 && amount !== 0;
  if (shouldUpdate) {
    clone[existingIndex] = [...rawEntry, 0];
    return [clone, existingIndex - 1];
  }

  const shouldInsert = existingIndex === -1 && amount !== 0;
  if (shouldInsert) {
    for (let i = 0; i <= clone.length; i++) {
      const current = clone[i];

      // We consider the index to be incorrect if the next item is existent (not at end) and still lower/greater.
      const isNotCorrectIndex = current && (direction === SortingDirection.ASKS ? id > current[0] : id < current[0]);
      if (isNotCorrectIndex) {
        continue;
      }

      clone.splice(i, 0, [...rawEntry, 0]);
      return [clone, i - 1];
    }
  }

  // We ignore the entry by returning the clone and a last correct index that is too high/low for the update function to
  // run.
  return [clone, clone.length - 1];
};

/**
 * Handles adding/updating multiple (new) entries into/in an existing entry array.
 *
 * @param entries Existing entry array.
 * @param nextEntries New or updated entries to add into/update the existing entries (with).
 * @param direction Direction the array is sorting in to correctly insert items.
 * @private
 *
 * @returns entries Updated array of entries.
 */
export const handleNewEntries = (entries: Entry[], nextEntries: RawEntry[], direction: SortingDirection): Entry[] => {
  let clone = [...entries];

  let lastCorrectIndex = direction === SortingDirection.ASKS ? 0 : entries.length - 1;
  for (const entry of nextEntries) {
    const [nextClone, updateIndex] = handleNewEntry(clone, entry, direction);

    clone = nextClone;
    lastCorrectIndex = Math.min(updateIndex, lastCorrectIndex);
  }

  // We decide to do this here since doing it on each insertion would possibly mean lots of overwritten calculations.
  return updateEntryTotalsFromLastCorrectIndex(clone, lastCorrectIndex);
};
