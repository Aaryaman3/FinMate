'use client';

import { Bank } from '@/lib/bank-data';
import { Building2, DollarSign, Check } from 'lucide-react';

interface BankCardProps {
  bank: Bank;
}

export function BankCard({ bank }: BankCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <Building2 className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{bank.name}</h3>
            <p className="text-sm text-gray-600">{bank.type}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-indigo-600">
            ${bank.monthlyFee}
          </p>
          <p className="text-xs text-gray-600">per month</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="text-sm font-semibold">
            {bank.requiresSSN ? 'SSN Required' : 'No SSN Required'}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-600 mb-2">Features:</p>
        <ul className="space-y-2">
          {bank.features.slice(0, 3).map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-4 border-t">
        <p className="text-sm font-semibold text-gray-600 mb-2">Best For:</p>
        <div className="flex gap-2 flex-wrap">
          {bank.bestFor.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
