
import React from 'react';
import { BoltIcon } from './icons/BoltIcon';

export const Header = () => (
  <header className="flex items-center p-4 border-b border-dark-surface-2 shadow-md">
    <BoltIcon className="w-8 h-8 text-brand-green" />
    <h1 className="ml-3 text-2xl font-bold tracking-tight text-white">
      Battery AI Assistant
    </h1>
  </header>
);
