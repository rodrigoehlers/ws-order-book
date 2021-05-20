import React from 'react';
import { ArrowSmDownIcon, ArrowSmUpIcon } from '@heroicons/react/solid';
import { joinWithSpace } from '../utils/styling';
import { GroupingOption } from './OrderBookFeature';
import { getReadableNumber } from '../utils/intl';

export interface ControlsFeatureProps extends React.HTMLAttributes<HTMLDivElement> {
  groupingOption: GroupingOption;
  isDecreasePossible: boolean;
  onDecrease(): void;
  isIncreasePossible: boolean;
  onIncrease(): void;
}

const ControlsFeature = (props: ControlsFeatureProps) => {
  const { groupingOption, isDecreasePossible, onDecrease, isIncreasePossible, onIncrease, ...rest } = props;
  return (
    <div {...rest}>
      <div className="flex justify-center mb-2">
        <h4 className="sm:text-xl font-bold text-lg">Controls</h4>
      </div>

      <div className="flex flex-col items-center justify-center">
        <h5 className="sm:text-xl text-lg text-gray-700 font-medium whitespace-nowrap">Group</h5>
        <p className="text-sm text-gray-700 text-center 2xl:w-1/5 md:w-1/4 sm:w-1/2 w-3/4">
          The spread at which the order book will group orders together. Adjustable in pre-defined steps between{' '}
          {getReadableNumber(0.5)} and {getReadableNumber(2500)}.
        </p>
        <span className="text-gray-700 mt-2 mb-2">
          Group is currently set to{' '}
          <span className="text-gray-700 font-medium">{getReadableNumber(groupingOption.name)}</span>.
        </span>
        <div className="flex items-center justify-between space-x-4 w-min">
          <div>
            <span className="relative z-0 inline-flex shadow-sm rounded-md">
              <button
                disabled={!isDecreasePossible}
                type="button"
                className={joinWithSpace(
                  'relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 text-sm font-medium text-gray-500 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500',
                  !isDecreasePossible ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50'
                )}
                onClick={onDecrease}
              >
                <div className="flex justify-center items-center space-x-1">
                  <ArrowSmDownIcon className="h-4 w-4" aria-hidden="true" />
                  <span>Decrease</span>
                </div>
              </button>
              <button
                type="button"
                disabled={!isIncreasePossible}
                className={joinWithSpace(
                  '-ml-px relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 text-sm font-medium text-gray-500 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500',
                  !isIncreasePossible ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50'
                )}
                onClick={onIncrease}
              >
                <div className="flex justify-center items-center space-x-1">
                  <span>Increase</span>
                  <ArrowSmUpIcon className="h-4 w-4" aria-hidden="true" />
                </div>
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ControlsFeature;
