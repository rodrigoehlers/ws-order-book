import React from 'react';
import { XIcon, ExclamationIcon, StatusOnlineIcon } from '@heroicons/react/outline';
import { joinWithSpace } from '../utils/styling';

export interface StatusHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  level: 'success' | 'warn' | 'error';
  pulse: boolean;
}

const StatusHeader = (props: StatusHeaderProps) => {
  const { label, level, pulse = true } = props;

  const isSuccess = level === 'success';
  const isWarn = level === 'warn';

  const Icon = isSuccess ? StatusOnlineIcon : isWarn ? ExclamationIcon : XIcon;

  return (
    <div
      className={joinWithSpace(
        'rounded-md jusify-center p-2',
        isSuccess ? 'bg-green-50' : isWarn ? 'bg-yellow-50' : 'bg-red-50'
      )}
    >
      <div
        className={joinWithSpace(
          'flex justify-center items-center space-x-1',
          'text-sm font-medium',
          isSuccess ? 'text-green-800' : isWarn ? 'text-yellow-800' : 'text-red-800',
          pulse ? 'animate-pulse' : undefined
        )}
      >
        <span>{label}</span>
        <Icon className="h-4 w-4" />
      </div>
    </div>
  );
};

export default StatusHeader;
