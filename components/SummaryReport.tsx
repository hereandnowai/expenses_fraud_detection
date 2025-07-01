
import React from 'react';
import { ExpenseReportEntry, RiskScore } from '../types';

interface SummaryReportProps {
  expenses: ExpenseReportEntry[];
}

export const SummaryReport: React.FC<SummaryReportProps> = ({ expenses }) => {
  if (expenses.length === 0) {
    return null;
  }

  const totalExpenses = expenses.length;
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  // Assuming all expenses are in the same currency for simplicity, or pick the first one.
  const currency = expenses.length > 0 ? expenses[0].currency : 'USD';

  const flaggedExpenses = expenses.filter(exp => exp.analysis?.isFlagged).length;
  const highRiskExpenses = expenses.filter(exp => exp.analysis?.riskScore === RiskScore.High).length;
  const mediumRiskExpenses = expenses.filter(exp => exp.analysis?.riskScore === RiskScore.Medium).length;
  const lowRiskExpenses = expenses.filter(exp => exp.analysis?.riskScore === RiskScore.Low).length;
  const pendingAnalysis = expenses.filter(exp => !exp.analysis).length;

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg mb-8 border border-brand-secondary/30">
      <h2 className="text-xl font-semibold text-brand-primary mb-4">Overall Expense Summary</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
        <SummaryItem label="Total Expenses Submitted" value={totalExpenses.toString()} />
        <SummaryItem label="Total Amount Submitted" value={`${totalAmount.toLocaleString(undefined, { style: 'currency', currency: currency })}`} />
        <SummaryItem label="Flagged for Review" value={flaggedExpenses.toString()} className={flaggedExpenses > 0 ? "text-red-600 font-bold" : ""} />
        <SummaryItem label="High Risk" value={highRiskExpenses.toString()} className={highRiskExpenses > 0 ? "text-red-700 font-bold" : ""} />
        <SummaryItem label="Medium Risk" value={mediumRiskExpenses.toString()} className={mediumRiskExpenses > 0 ? "text-yellow-600 font-bold" : ""} />
        <SummaryItem label="Low Risk" value={lowRiskExpenses.toString()} />
        {pendingAnalysis > 0 && <SummaryItem label="Pending Analysis" value={pendingAnalysis.toString()} className="text-gray-500" />}
      </div>
    </div>
  );
};

interface SummaryItemProps {
  label: string;
  value: string;
  className?: string;
}

const SummaryItem: React.FC<SummaryItemProps> = ({ label, value, className }) => (
  <div className="p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
    <p className="text-gray-500">{label}</p>
    <p className={`text-lg font-semibold text-brand-text ${className}`}>{value}</p>
  </div>
);
