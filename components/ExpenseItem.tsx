
import React, { useState }
from 'react';
import { ExpenseReportEntry, RiskScore, PolicyViolation, Anomaly } from '../types';
import { AnalysisResultDisplay } from './AnalysisResultDisplay'; 

interface ExpenseItemProps {
  expense: ExpenseReportEntry;
}

const getRiskScoreClass = (score: RiskScore | undefined | null): string => {
  if (!score) return 'bg-gray-200 text-gray-700'; // Fallback, consider theme variable for this too
  switch (score) {
    case RiskScore.Low:
      return 'bg-status-success-bg text-status-success-text border-status-success-border';
    case RiskScore.Medium:
      return 'bg-status-warning-bg text-status-warning-text border-status-warning-border';
    case RiskScore.High:
      return 'bg-status-danger-bg text-status-danger-text border-status-danger-border';
    default: // Unknown
      return 'bg-brand-surface-alt text-brand-text-muted border-brand-border';
  }
};

const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

const ChevronUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
  </svg>
);

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

export const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDownloadReceipt = () => {
    if (expense.receiptImageDataUrl && expense.receiptImageName) {
      const link = document.createElement('a');
      link.href = expense.receiptImageDataUrl;
      link.download = expense.receiptImageName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-brand-surface shadow-lg rounded-xl overflow-hidden border border-brand-border transition-all duration-300 hover:shadow-xl">
      <div className="p-4 md:p-6 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="mb-2 sm:mb-0">
            <h3 className="text-lg font-semibold text-brand-primary">{expense.vendor} - <span className="text-brand-text-muted font-normal">{expense.category}</span></h3>
            <p className="text-sm text-brand-babypink">
              {expense.employeeName} on {new Date(expense.date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-3">
             <span className="text-xl font-semibold text-brand-text-base">
              {expense.amount.toLocaleString(undefined, { style: 'currency', currency: expense.currency })}
            </span>
            {expense.analysis && (
              <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getRiskScoreClass(expense.analysis.riskScore)}`}>
                Risk: {expense.analysis.riskScore}
              </span>
            )}
            {!expense.analysis && (
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-brand-surface-alt text-brand-text-muted border-brand-border">
                Analysis Pending
              </span>
            )}
            <button
              aria-label={isExpanded ? "Collapse details" : "Expand details"}
              className="text-brand-primary hover:text-brand-primary-dark p-1 rounded-full hover:bg-brand-surface-alt"
            >
              {isExpanded ? <ChevronUpIcon className="w-6 h-6" /> : <ChevronDownIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
         {isExpanded && expense.analysis && (
            <p className="mt-2 text-sm text-brand-text-muted italic">
                <strong>AI Summary:</strong> {expense.analysis.summary}
            </p>
        )}
      </div>

      {isExpanded && (
        <div className="border-t border-brand-border bg-brand-surface-alt/50 p-4 md:p-6">
          <h4 className="text-md font-semibold text-brand-text-heading mb-3">Expense Details:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm mb-4 text-brand-text-base">
            <p><strong>Employee:</strong> {expense.employeeName}</p>
            <p><strong>Date:</strong> {new Date(expense.date).toLocaleDateString()}</p>
            <p><strong>Vendor:</strong> {expense.vendor}</p>
            <p><strong>Category:</strong> {expense.category}</p>
            <p><strong>Amount:</strong> {expense.amount.toLocaleString(undefined, { style: 'currency', currency: expense.currency })}</p>
            
            {expense.receiptImageName && (
              <div className="md:col-span-2 flex items-center">
                <strong>Receipt:</strong> 
                <span className="ml-1 mr-2">{expense.receiptImageName}</span>
                {expense.receiptImageDataUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); 
                      handleDownloadReceipt();
                    }}
                    className="inline-flex items-center px-2.5 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-action-blue-bg hover:bg-action-blue-hover-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-action-blue-bg transition-colors"
                    aria-label={`Download receipt image ${expense.receiptImageName}`}
                  >
                    <DownloadIcon className="w-3 h-3 mr-1" />
                    Download Image
                  </button>
                )}
              </div>
            )}
          </div>
          <p className="text-sm mb-4 text-brand-text-base"><strong>Description:</strong> {expense.description}</p>
          
          {expense.analysis ? (
            <AnalysisResultDisplay analysis={expense.analysis} />
          ) : (
            <p className="text-center text-brand-text-muted py-4">AI analysis is not available for this expense yet.</p>
          )}
        </div>
      )}
    </div>
  );
};