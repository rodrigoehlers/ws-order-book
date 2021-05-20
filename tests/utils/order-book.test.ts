import { SortingDirection } from '../../utils/ws-api';
import { handleNewEntry, updateEntryTotalsFromLastCorrectIndex } from '../../utils/crypto-facilities-order-book';
import { Asks, Bids, RawAsks, RawBids } from '../../integrations/crypto-facilities-order-book';

const asks: Asks = [
  [1, 1, 1],
  [2, 2, 3],
  [3, 3, 6],
  [4, 4, 10],
  [5, 5, 15],
  [6, 6, 21],
  [7, 7, 28],
  [8, 8, 36],
  [9, 9, 45],
  [10, 10, 55],
];

const bids: Bids = [
  [10, 10, 55],
  [9, 9, 45],
  [8, 8, 36],
  [7, 7, 28],
  [6, 6, 21],
  [5, 5, 15],
  [4, 4, 10],
  [3, 3, 6],
  [2, 2, 3],
  [1, 1, 1],
];

const rawAsks: RawAsks = [
  [1, 1],
  [2, 2],
  [3, 3],
  [4, 4],
  [5, 5],
  [6, 6],
  [7, 7],
  [8, 8],
  [9, 9],
  [10, 10],
];

const rawBids: RawBids = [
  [10, 10],
  [9, 9],
  [8, 8],
  [7, 7],
  [6, 6],
  [5, 5],
  [4, 4],
  [3, 3],
  [2, 2],
  [1, 1],
];

describe('utils/order-book.ts', () => {
  describe('updateEntryTotalsFromLastCorrectIndex', () => {
    describe('asks', () => {
      const direction = SortingDirection.ASKS;

      let asksClone;
      beforeEach(() => {
        asksClone = [...asks];
      });

      describe('update', () => {
        it('correctly updates totals after entry update at middle of array', () => {
          // Mocking an update in the middle.
          asksClone[4] = [5, 10, 0];

          const updatedAsksClone = updateEntryTotalsFromLastCorrectIndex(asksClone, direction, 3);
          expect(updatedAsksClone[0]).toStrictEqual([1, 1, 1]);
          expect(updatedAsksClone[4]).toStrictEqual([5, 10, 20]);
          expect(updatedAsksClone[9]).toStrictEqual([10, 10, 60]);
        });

        it('correctly updates totals after entry update at 0', () => {
          // Mocking an update at 0.
          asksClone[0] = [1, 11, 0];

          const updatedAsksClone = updateEntryTotalsFromLastCorrectIndex(asksClone, direction, -1);
          expect(updatedAsksClone[0]).toStrictEqual([1, 11, 11]);
          expect(updatedAsksClone[4]).toStrictEqual([5, 5, 25]);
          expect(updatedAsksClone[9]).toStrictEqual([10, 10, 65]);
        });

        it('correctly updates totals after entry update at end of array', () => {
          // Mocking an update at the end of the array.
          asksClone[9] = [10, 100, 0];

          const updatedAsksClone = updateEntryTotalsFromLastCorrectIndex(asksClone, direction, 8);
          expect(updatedAsksClone[0]).toStrictEqual([1, 1, 1]);
          expect(updatedAsksClone[4]).toStrictEqual([5, 5, 15]);
          expect(updatedAsksClone[9]).toStrictEqual([10, 100, 145]);
        });
      });

      describe('deletion', () => {
        it('correctly updates totals after entry removal at middle of array', () => {
          // Remove an item in the middle.
          asksClone.splice(3, 1);

          const updatedAsksClone = updateEntryTotalsFromLastCorrectIndex(asksClone, direction, 2);
          expect(updatedAsksClone[0]).toStrictEqual([1, 1, 1]);
          expect(updatedAsksClone[3]).toStrictEqual([5, 5, 11]);
          expect(updatedAsksClone[8]).toStrictEqual([10, 10, 51]);
        });

        it('correctly updates totals after entry removal at 0', () => {
          // Remove the first item.
          asksClone.splice(0, 1);

          const updatedAsksClone = updateEntryTotalsFromLastCorrectIndex(asksClone, direction, -1);
          expect(updatedAsksClone[0]).toStrictEqual([2, 2, 2]);
          expect(updatedAsksClone[3]).toStrictEqual([5, 5, 14]);
          expect(updatedAsksClone[8]).toStrictEqual([10, 10, 54]);
        });

        it('correctly updates totals after entry removal at end of array', () => {
          // Remove the last item.
          asksClone.splice(asksClone.length - 1, 1);

          const updatedAsksClone = updateEntryTotalsFromLastCorrectIndex(asksClone, direction, asksClone.length - 1);
          expect(updatedAsksClone[0]).toStrictEqual([1, 1, 1]);
          expect(updatedAsksClone[4]).toStrictEqual([5, 5, 15]);
          expect(updatedAsksClone[8]).toStrictEqual([9, 9, 45]);
        });
      });

      describe('insertion', () => {
        it('correctly updates totals after entry insertion at middle of array', () => {
          // Insert new entry into middle of array.
          asksClone.splice(3, 0, [99, 99, 99]);

          const updatedAsksClone = updateEntryTotalsFromLastCorrectIndex(asksClone, direction, 2);
          expect(updatedAsksClone[0]).toStrictEqual([1, 1, 1]);
          expect(updatedAsksClone[4]).toStrictEqual([4, 4, 109]);
          expect(updatedAsksClone[10]).toStrictEqual([10, 10, 154]);
        });

        it('correctly updates totals after entry insertion at 0', () => {
          const asksClone = [...asks];

          // Insert at start of array.
          asksClone.splice(0, 0, [99, 99, 99]);

          const updatedAsksClone = updateEntryTotalsFromLastCorrectIndex(asksClone, direction, -1);
          expect(updatedAsksClone[1]).toStrictEqual([1, 1, 100]);
          expect(updatedAsksClone[4]).toStrictEqual([4, 4, 109]);
          expect(updatedAsksClone[10]).toStrictEqual([10, 10, 154]);
        });

        it('correctly updates totals after entry removal at end of array', () => {
          // Insert at end of array.
          asksClone.push([99, 99, 99]);

          const updatedAsksClone = updateEntryTotalsFromLastCorrectIndex(asksClone, direction, asksClone.length - 2);
          expect(updatedAsksClone[0]).toStrictEqual([1, 1, 1]);
          expect(updatedAsksClone[4]).toStrictEqual([5, 5, 15]);
          expect(updatedAsksClone[9]).toStrictEqual([10, 10, 55]);
          expect(updatedAsksClone[10]).toStrictEqual([99, 99, 154]);
        });
      });
    });

    describe('bids', () => {
      const direction = SortingDirection.BIDS;

      let bidsClone;
      beforeEach(() => {
        bidsClone = [...bids];
      });

      describe('update', () => {
        it('correctly updates totals after entry update at middle of array', () => {
          // Mocking an update in the middle.
          bidsClone[4] = [6, 26, 0];

          const updatedAsksClone = updateEntryTotalsFromLastCorrectIndex(bidsClone, direction, 5);
          expect(updatedAsksClone[0]).toStrictEqual([10, 10, 75]);
          expect(updatedAsksClone[4]).toStrictEqual([6, 26, 41]);
          expect(updatedAsksClone[9]).toStrictEqual([1, 1, 1]);
        });

        it('correctly updates totals after entry update at 0', () => {
          // Mocking an update at 0.
          bidsClone[0] = [10, 20, 0];

          const updatedAsksClone = updateEntryTotalsFromLastCorrectIndex(bidsClone, direction, 1);
          expect(updatedAsksClone[0]).toStrictEqual([10, 20, 65]);
          expect(updatedAsksClone[4]).toStrictEqual([6, 6, 21]);
          expect(updatedAsksClone[9]).toStrictEqual([1, 1, 1]);
        });

        it('correctly updates totals after entry update at end of array', () => {
          // Mocking an update at the end of the array.
          bidsClone[9] = [1, 101, 0];

          const updatedAsksClone = updateEntryTotalsFromLastCorrectIndex(bidsClone, direction, bidsClone.length);
          expect(updatedAsksClone[0]).toStrictEqual([10, 10, 155]);
          expect(updatedAsksClone[4]).toStrictEqual([6, 6, 121]);
          expect(updatedAsksClone[9]).toStrictEqual([1, 101, 101]);
        });
      });

      describe('deletion', () => {
        it('correctly updates totals after entry removal at middle of array', () => {
          // Remove an item in the middle.
          bidsClone.splice(5, 1);

          const updatedAsksClone = updateEntryTotalsFromLastCorrectIndex(bidsClone, direction, 6);
          expect(updatedAsksClone[0]).toStrictEqual([10, 10, 50]);
          expect(updatedAsksClone[5]).toStrictEqual([4, 4, 10]);
          expect(updatedAsksClone[8]).toStrictEqual([1, 1, 1]);
        });

        it('correctly updates totals after entry removal at 0', () => {
          // Remove the first item.
          bidsClone.splice(0, 1);

          const updatedAsksClone = updateEntryTotalsFromLastCorrectIndex(bidsClone, direction, 0);
          expect(updatedAsksClone[0]).toStrictEqual([9, 9, 45]);
          expect(updatedAsksClone[3]).toStrictEqual([6, 6, 21]);
          expect(updatedAsksClone[8]).toStrictEqual([1, 1, 1]);
        });

        it('correctly updates totals after entry removal at end of array', () => {
          // Remove the last item.
          bidsClone.splice(bidsClone.length - 1, 1);

          const updatedAsksClone = updateEntryTotalsFromLastCorrectIndex(bidsClone, direction, bidsClone.length);
          expect(updatedAsksClone[0]).toStrictEqual([10, 10, 54]);
          expect(updatedAsksClone[4]).toStrictEqual([6, 6, 20]);
          expect(updatedAsksClone[8]).toStrictEqual([2, 2, 2]);
        });
      });

      describe('insertion', () => {
        it('correctly updates totals after entry insertion at middle of array', () => {
          // Insert new entry into middle of array.
          bidsClone.splice(5, 0, [99, 99, 99]);

          const updatedAsksClone = updateEntryTotalsFromLastCorrectIndex(bidsClone, direction, 6);
          expect(updatedAsksClone[0]).toStrictEqual([10, 10, 154]);
          expect(updatedAsksClone[4]).toStrictEqual([6, 6, 120]);
          expect(updatedAsksClone[10]).toStrictEqual([1, 1, 1]);
        });

        it('correctly updates totals after entry insertion at 0', () => {
          // Insert at start of array.
          bidsClone.splice(0, 0, [99, 99, 99]);

          const updatedAsksClone = updateEntryTotalsFromLastCorrectIndex(bidsClone, direction, 1);
          expect(updatedAsksClone[0]).toStrictEqual([99, 99, 154]);
          expect(updatedAsksClone[4]).toStrictEqual([7, 7, 28]);
          expect(updatedAsksClone[10]).toStrictEqual([1, 1, 1]);
        });

        it('correctly updates totals after entry removal at end of array', () => {
          // Insert at end of array.
          bidsClone.push([99, 99, 99]);

          const updatedAsksClone = updateEntryTotalsFromLastCorrectIndex(bidsClone, direction, bidsClone.length);
          expect(updatedAsksClone[0]).toStrictEqual([10, 10, 154]);
          expect(updatedAsksClone[4]).toStrictEqual([6, 6, 120]);
          expect(updatedAsksClone[9]).toStrictEqual([1, 1, 100]);
          expect(updatedAsksClone[10]).toStrictEqual([99, 99, 99]);
        });
      });
    });
  });

  describe('handleNewEntry', () => {
    describe('asks', () => {
      const direction = SortingDirection.ASKS;

      let asksClone;
      beforeEach(() => {
        asksClone = [...asks];
      });

      describe('delete', () => {
        it('correctly deletes an item at 0 and returns -1', () => {
          const [nextAsks, lastCorrectIndex] = handleNewEntry(asksClone, [1, 0], direction);
          expect(nextAsks.length).toBe(9);
          expect(nextAsks[0]).toStrictEqual([2, 2, 3]);
          expect(lastCorrectIndex).toBe(-1);
        });

        it('correctly deletes an item at middle of array its index minus 1', () => {
          const [nextAsks, lastCorrectIndex] = handleNewEntry(asksClone, [4, 0], direction);
          expect(nextAsks.length).toBe(9);
          expect(nextAsks[0]).toStrictEqual([1, 1, 1]);
          expect(nextAsks[3]).toStrictEqual([5, 5, 15]);
          // The item we're removing is at index 3 -> lastCorrectIndex should be 2.
          expect(lastCorrectIndex).toBe(2);
        });

        it('correctly deletes an item at the end of the array', () => {
          const [nextAsks, lastCorrectIndex] = handleNewEntry(asksClone, [10, 0], direction);
          expect(nextAsks.length).toBe(9);
          expect(nextAsks[0]).toStrictEqual([1, 1, 1]);
          expect(nextAsks[nextAsks.length - 1]).toStrictEqual([9, 9, 45]);
          // We removed the 'incorrect' item and didn't touch any others, therefore the new last is correct.
          expect(lastCorrectIndex).toBe(nextAsks.length - 1);
        });
      });

      describe('update', () => {
        it('correctly updates an item at 0', () => {
          const [nextAsks, lastCorrectIndex] = handleNewEntry(asksClone, [1, 10], direction);
          expect(nextAsks.length).toBe(10);
          expect(nextAsks[0]).toStrictEqual([1, 10, 0]);
          expect(lastCorrectIndex).toBe(-1);
        });

        it('correctly updates an item at middle of array', () => {
          const [nextAsks, lastCorrectIndex] = handleNewEntry(asksClone, [5, 10], direction);
          expect(nextAsks.length).toBe(10);
          expect(nextAsks[0]).toStrictEqual([1, 1, 1]);
          expect(nextAsks[4]).toStrictEqual([5, 10, 0]);
          expect(lastCorrectIndex).toBe(3);
        });

        it('correctly updates an item at end of array', () => {
          const [nextAsks, lastCorrectIndex] = handleNewEntry(asksClone, [10, 20], direction);
          expect(nextAsks.length).toBe(10);
          expect(nextAsks[0]).toStrictEqual([1, 1, 1]);
          expect(nextAsks[nextAsks.length - 1]).toStrictEqual([10, 20, 0]);
          expect(lastCorrectIndex).toBe(nextAsks.length - 2);
        });
      });

      describe('insert', () => {
        it('correctly inserts an item at the start of array', () => {
          const [nextAsks, lastCorrectIndex] = handleNewEntry(asksClone, [0.5, 20], direction);
          expect(nextAsks.length).toBe(11);
          expect(nextAsks[0]).toStrictEqual([0.5, 20, 0]);
          expect(nextAsks[1]).toStrictEqual([1, 1, 1]);
          expect(lastCorrectIndex).toBe(-1);
        });

        it('correctly inserts an item at middle of array', () => {
          const [nextAsks, lastCorrectIndex] = handleNewEntry(asksClone, [4.5, 20], direction);
          expect(nextAsks.length).toBe(11);
          expect(nextAsks[0]).toStrictEqual([1, 1, 1]);
          expect(nextAsks[3]).toStrictEqual([4, 4, 10]);
          expect(nextAsks[4]).toStrictEqual([4.5, 20, 0]);
          expect(lastCorrectIndex).toBe(3);
        });

        it('correctly inserts an item at end of array', () => {
          const [nextAsks, lastCorrectIndex] = handleNewEntry(asksClone, [11, 20], direction);
          expect(nextAsks.length).toBe(11);
          expect(nextAsks[0]).toStrictEqual([1, 1, 1]);
          expect(nextAsks[nextAsks.length - 2]).toStrictEqual([10, 10, 55]);
          expect(nextAsks[nextAsks.length - 1]).toStrictEqual([11, 20, 0]);
          expect(lastCorrectIndex).toBe(nextAsks.length - 2);
        });
      });
    });

    describe('bids', () => {
      const direction = SortingDirection.BIDS;

      let bidsClone;
      beforeEach(() => {
        bidsClone = [...bids];
      });

      describe('delete', () => {
        it('correctly deletes an item at 0 and returns 0', () => {
          const [nextAsks, lastCorrectIndex] = handleNewEntry(bidsClone, [10, 0], direction);
          expect(nextAsks.length).toBe(9);
          expect(nextAsks[0]).toStrictEqual([9, 9, 45]);
          expect(lastCorrectIndex).toBe(0);
        });

        it('correctly deletes an item at middle of array and returns its index', () => {
          const [nextAsks, lastCorrectIndex] = handleNewEntry(bidsClone, [4, 0], direction);
          expect(nextAsks.length).toBe(9);
          expect(nextAsks[0]).toStrictEqual([10, 10, 55]);
          expect(nextAsks[6]).toStrictEqual([3, 3, 6]);
          // The item we're removing is at index 6 -> lastCorrectIndex should therefore be 7 in the original array.
          // But 6 in the new one.
          expect(lastCorrectIndex).toBe(6);
        });

        it('correctly deletes an item at the end of the array and returns its index', () => {
          const [nextAsks, lastCorrectIndex] = handleNewEntry(bidsClone, [1, 0], direction);
          expect(nextAsks.length).toBe(9);
          expect(nextAsks[0]).toStrictEqual([10, 10, 55]);
          expect(nextAsks[nextAsks.length - 1]).toStrictEqual([2, 2, 3]);
          // We removed the last item (the first in sorting direction) therefore we need to redo the whole array.
          expect(lastCorrectIndex).toBe(nextAsks.length);
        });
      });

      describe('update', () => {
        it('correctly updates an item at 0 and returns its index + 1', () => {
          const [nextAsks, lastCorrectIndex] = handleNewEntry(bidsClone, [10, 20], direction);
          expect(nextAsks.length).toBe(10);
          expect(nextAsks[0]).toStrictEqual([10, 20, 0]);
          expect(nextAsks[1]).toStrictEqual([9, 9, 45]);
          expect(lastCorrectIndex).toBe(1);
        });

        it('correctly updates an item at middle of array and returns its index + 1', () => {
          const [nextAsks, lastCorrectIndex] = handleNewEntry(bidsClone, [7, 20], direction);
          expect(nextAsks.length).toBe(10);
          expect(nextAsks[3]).toStrictEqual([7, 20, 0]);
          expect(nextAsks[4]).toStrictEqual([6, 6, 21]);
          expect(lastCorrectIndex).toBe(4);
        });

        it('correctly updates the last item and returns its index + 1', () => {
          const [nextAsks, lastCorrectIndex] = handleNewEntry(bidsClone, [1, 20], direction);
          expect(nextAsks.length).toBe(10);
          expect(nextAsks[nextAsks.length - 2]).toStrictEqual([2, 2, 3]);
          expect(nextAsks[nextAsks.length - 1]).toStrictEqual([1, 20, 0]);
          expect(lastCorrectIndex).toBe(nextAsks.length);
        });
      });

      describe('insert', () => {
        it('correctly inserts an item at 0 and returns the insertion point index + 1', () => {
          const [nextAsks, lastCorrectIndex] = handleNewEntry(bidsClone, [11, 20], direction);
          expect(nextAsks.length).toBe(11);
          expect(nextAsks[0]).toStrictEqual([11, 20, 0]);
          expect(nextAsks[1]).toStrictEqual([10, 10, 55]);
          expect(lastCorrectIndex).toBe(1);
        });

        it('correctly inserts an item at the middle of the array and returns the insertion point index + 1', () => {
          const [nextAsks, lastCorrectIndex] = handleNewEntry(bidsClone, [6.5, 20], direction);
          expect(nextAsks.length).toBe(11);
          expect(nextAsks[4]).toStrictEqual([6.5, 20, 0]);
          expect(nextAsks[5]).toStrictEqual([6, 6, 21]);
          expect(lastCorrectIndex).toBe(5);
        });

        it('correctly inserts an item at the end of the array and returns the insertion point index + 1', () => {
          const [nextAsks, lastCorrectIndex] = handleNewEntry(bidsClone, [0.5, 20], direction);
          expect(nextAsks.length).toBe(11);
          expect(nextAsks[nextAsks.length - 2]).toStrictEqual([1, 1, 1]);
          expect(nextAsks[nextAsks.length - 1]).toStrictEqual([0.5, 20, 0]);
          expect(lastCorrectIndex).toBe(nextAsks.length);
        });
      });
    });
  });

  // describe('transformRawEntriesToEntries', () => {
  //   describe('asks', () => {
  //     it('correctly transforms RawAsks to Asks', () => {
  //       const transformedRawAsks = transformRawEntriesToEntries(rawAsks, SortingDirection.ASKS);
  //       expect(transformedRawAsks).toStrictEqual(asks);
  //     });
  //   });
  //
  //   describe('bids', () => {
  //     it('correctly transforms RawBids to Bids', () => {
  //       const transformedRawBids = transformRawEntriesToEntries(rawBids, SortingDirection.BIDS);
  //       expect(transformedRawBids).toStrictEqual(bids);
  //     });
  //   });
  // });
});
