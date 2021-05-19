import { SortingDirection } from '../../utils/ws-api';
import { updateEntryTotalsFromLastCorrectIndex } from '../../utils/order-book';
import { Asks, Bids } from '../../integrations/order-book';

describe('updateEntryTotalsFromLastCorrectIndex', () => {
  describe('asks', () => {
    const direction = SortingDirection.ASKS;

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

    describe('update', () => {
      it('correctly updates totals after entry update at middle of array', () => {
        const asksClone = [...asks];

        // Mocking an update in the middle.
        asksClone[4] = [5, 10, 0];

        const updatedAsksClone = updateEntryTotalsFromLastCorrectIndex(asksClone, direction, 3);
        expect(updatedAsksClone[0]).toStrictEqual([1, 1, 1]);
        expect(updatedAsksClone[4]).toStrictEqual([5, 10, 20]);
        expect(updatedAsksClone[9]).toStrictEqual([10, 10, 60]);
      });

      it('correctly updates totals after entry update at 0', () => {
        const asksClone = [...asks];

        // Mocking an update at 0.
        asksClone[0] = [1, 11, 0];

        const updatedAsksClone = updateEntryTotalsFromLastCorrectIndex(asksClone, direction, -1);
        expect(updatedAsksClone[0]).toStrictEqual([1, 11, 11]);
        expect(updatedAsksClone[4]).toStrictEqual([5, 5, 25]);
        expect(updatedAsksClone[9]).toStrictEqual([10, 10, 65]);
      });

      it('correctly updates totals after entry update at end of array', () => {
        const asksClone = [...asks];

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
        const asksClone = [...asks];

        // Remove an item in the middle.
        asksClone.splice(3, 1);

        const updatedAsksClone = updateEntryTotalsFromLastCorrectIndex(asksClone, direction, 2);
        expect(updatedAsksClone[0]).toStrictEqual([1, 1, 1]);
        expect(updatedAsksClone[3]).toStrictEqual([5, 5, 11]);
        expect(updatedAsksClone[8]).toStrictEqual([10, 10, 51]);
      });

      it('correctly updates totals after entry removal at 0', () => {
        const asksClone = [...asks];

        // Remove the first item.
        asksClone.splice(0, 1);

        const updatedAsksClone = updateEntryTotalsFromLastCorrectIndex(asksClone, direction, -1);
        expect(updatedAsksClone[0]).toStrictEqual([2, 2, 2]);
        expect(updatedAsksClone[3]).toStrictEqual([5, 5, 14]);
        expect(updatedAsksClone[8]).toStrictEqual([10, 10, 54]);
      });

      it('correctly updates totals after entry removal at end of array', () => {
        const asksClone = [...asks];

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
        const asksClone = [...asks];

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
        const asksClone = [...asks];

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

    describe('update', () => {
      it('correctly updates totals after entry update at middle of array', () => {
        const bidsClone = [...bids];

        // Mocking an update in the middle.
        bidsClone[4] = [6, 26, 0];

        const updatedAsksClone = updateEntryTotalsFromLastCorrectIndex(bidsClone, direction, 5);
        expect(updatedAsksClone[0]).toStrictEqual([10, 10, 75]);
        expect(updatedAsksClone[4]).toStrictEqual([6, 26, 41]);
        expect(updatedAsksClone[9]).toStrictEqual([1, 1, 1]);
      });

      it('correctly updates totals after entry update at 0', () => {
        const bidsClone = [...bids];

        // Mocking an update at 0.
        bidsClone[0] = [10, 20, 0];

        const updatedAsksClone = updateEntryTotalsFromLastCorrectIndex(bidsClone, direction, 1);
        expect(updatedAsksClone[0]).toStrictEqual([10, 20, 65]);
        expect(updatedAsksClone[4]).toStrictEqual([6, 6, 21]);
        expect(updatedAsksClone[9]).toStrictEqual([1, 1, 1]);
      });

      it('correctly updates totals after entry update at end of array', () => {
        const bidsClone = [...bids];

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
        const bidsClone = [...bids];

        // Remove an item in the middle.
        bidsClone.splice(5, 1);

        const updatedAsksClone = updateEntryTotalsFromLastCorrectIndex(bidsClone, direction, 6);
        expect(updatedAsksClone[0]).toStrictEqual([10, 10, 50]);
        expect(updatedAsksClone[5]).toStrictEqual([4, 4, 10]);
        expect(updatedAsksClone[8]).toStrictEqual([1, 1, 1]);
      });

      it('correctly updates totals after entry removal at 0', () => {
        const bidsClone = [...bids];

        // Remove the first item.
        bidsClone.splice(0, 1);

        const updatedAsksClone = updateEntryTotalsFromLastCorrectIndex(bidsClone, direction, 0);
        expect(updatedAsksClone[0]).toStrictEqual([9, 9, 45]);
        expect(updatedAsksClone[3]).toStrictEqual([6, 6, 21]);
        expect(updatedAsksClone[8]).toStrictEqual([1, 1, 1]);
      });

      it('correctly updates totals after entry removal at end of array', () => {
        const bidsClone = [...bids];

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
        const bidsClone = [...bids];

        // Insert new entry into middle of array.
        bidsClone.splice(5, 0, [99, 99, 99]);

        const updatedAsksClone = updateEntryTotalsFromLastCorrectIndex(bidsClone, direction, 6);
        expect(updatedAsksClone[0]).toStrictEqual([10, 10, 154]);
        expect(updatedAsksClone[4]).toStrictEqual([6, 6, 120]);
        expect(updatedAsksClone[10]).toStrictEqual([1, 1, 1]);
      });

      it('correctly updates totals after entry insertion at 0', () => {
        const bidsClone = [...bids];

        // Insert at start of array.
        bidsClone.splice(0, 0, [99, 99, 99]);

        const updatedAsksClone = updateEntryTotalsFromLastCorrectIndex(bidsClone, direction, 1);
        expect(updatedAsksClone[0]).toStrictEqual([99, 99, 154]);
        expect(updatedAsksClone[4]).toStrictEqual([7, 7, 28]);
        expect(updatedAsksClone[10]).toStrictEqual([1, 1, 1]);
      });

      it('correctly updates totals after entry removal at end of array', () => {
        const bidsClone = [...bids];

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
