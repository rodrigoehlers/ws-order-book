import { Entry, RawEntry } from '../integrations/order-book';
import { SortingDirection } from './ws-api';

export const transformRawEntriesToEntries = (entries: RawEntry[], direction: SortingDirection): Entry[] => {
  // We start at -1 to signal we have to 'redo' the whole thing.
  return updateEntryTotalsFromLastCorrectIndex(entries as unknown as Entry[], direction, -1);
};

export const updateEntryTotalsFromLastCorrectIndex = (
  entries: Entry[],
  direction,
  lastCorrectIndex: number = -1
): Entry[] => {
  // No need to update if the last correct index already is the last/first item.
  if (direction === SortingDirection.ASKS ? lastCorrectIndex === entries.length - 1 : lastCorrectIndex === 0) {
    return entries;
  }

  // Retrieve the real last correct total or 0.
  const [, , lastCorrectTotal] = entries[lastCorrectIndex] ?? [0, 0, 0];
  let currentTotal = lastCorrectTotal;

  // A `lastCorrectIndex` of 0/length of entries means we should redo the whole thing.
  const startingPoint =
    direction === SortingDirection.ASKS
      ? Math.max(lastCorrectIndex + 1, 0)
      : Math.min(lastCorrectIndex - 1, entries.length - 1);

  let updatedEntries: Entry[] =
    direction === SortingDirection.ASKS ? entries.slice(0, startingPoint) : entries.slice(startingPoint + 1);

  for (
    let i = startingPoint;
    direction === SortingDirection.ASKS ? i < entries.length : i > -1;
    direction === SortingDirection.ASKS ? (i += 1) : (i -= 1)
  ) {
    const current = entries[i];

    const [id, amount] = current;
    currentTotal += amount;

    const currentWithTotal: Entry = [id, amount, currentTotal];
    if (direction === SortingDirection.ASKS) {
      updatedEntries = [...updatedEntries, currentWithTotal];
    } else {
      updatedEntries = [currentWithTotal, ...updatedEntries];
    }
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
    const lastCorrectIndex = direction === SortingDirection.ASKS ? existingIndex - 1 : existingIndex + 1;
    return [clone, lastCorrectIndex];
  }

  const shouldUpdate = existingIndex !== -1 && amount !== 0;
  if (shouldUpdate) {
    clone[existingIndex] = [...rawEntry, 0];
    const lastCorrectIndex = direction === SortingDirection.ASKS ? existingIndex - 1 : existingIndex + 1;
    return [clone, lastCorrectIndex];
  }

  const shouldInsert = existingIndex === -1 && amount !== 0;
  if (shouldInsert) {
    for (let i = 0; i <= clone.length; i++) {
      const current = clone[i];

      // We consider the index to be incorrect if the next item is existent (not at end) and still lower/greater.
      const isNotCorrectIndex = current && (direction === SortingDirection.ASKS ? id < current[0] : id > current[0]);
      if (isNotCorrectIndex) {
        continue;
      }

      clone.splice(i, 0, [...rawEntry, 0]);
      const lastCorrectIndex = direction === SortingDirection.ASKS ? existingIndex - 1 : existingIndex + 1;
      return [clone, lastCorrectIndex];
    }
  }

  // We ignore the entry by returning the clone and a last correct index that is too high/low for the update function to
  // run.
  const lastCorrectIndex = direction === SortingDirection.ASKS ? clone.length - 1 : 0;
  return [clone, lastCorrectIndex];
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

  let lowestUpdateIndex = 0;
  for (const entry of nextEntries) {
    const [nextClone, updateIndex] = handleNewEntry(clone, entry, direction);
    clone = nextClone;
    lowestUpdateIndex = updateIndex < lowestUpdateIndex ? updateIndex : lowestUpdateIndex;
  }

  // We decide to do this here since doing it on each insertion would possibly mean lots of overwritten calculations.
  return updateEntryTotalsFromLastCorrectIndex(clone, lowestUpdateIndex);
};
