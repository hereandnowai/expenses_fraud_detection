
import React from 'react';
import { ExpenseReportEntry } from '../types';
import { ExpenseItem } from './ExpenseItem';

interface ExpenseListProps {
  expenses: ExpenseReportEntry[];
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses }) => {
  if (expenses.length === 0) {
    return null; // The App component handles the empty state message
  }

  return (
    <div className="space-y-6 mt-8">
      {expenses.map((expense) => (
        <ExpenseItem key={expense.id} expense={expense} />
      ))}
    </div>
  );
};
