import React, { Fragment, ReactNode } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid';

export interface SelectProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  options: T[];
  value: T;
  onOptionChange(nextValue: T): void;
  renderOption(options: T): ReactNode;
  renderButtonContent(value: T): ReactNode;
}

const Select = <T,>(props: SelectProps<T>) => {
  const { options, onOptionChange, value, renderOption, renderButtonContent, ...rest } = props;

  return (
    <Listbox value={value} onChange={onOptionChange}>
      <div {...rest}>
        <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white rounded-lg shadow-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
          {renderButtonContent(value)}
        </Listbox.Button>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options className="absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {options.map(renderOption)}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

export default Select;
