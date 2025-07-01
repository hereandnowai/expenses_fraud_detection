
import React, { useState } from 'react';
import { ExpenseReportEntry, ExpenseCategory } from '../types';
import { DEFAULT_CURRENCY, EXPENSE_CATEGORIES } from '../constants';

interface ExpenseFormProps {
  onSubmit: (
    data: Omit<ExpenseReportEntry, 'id' | 'analysis' | 'receiptImageName'>,
    receiptFile: File | null
  ) => void;
  isLoading: boolean;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, isLoading }) => {
  const [employeeName, setEmployeeName] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY);
  const [vendor, setVendor] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.OfficeSupplies);
  const [description, setDescription] = useState<string>('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setFormError("Receipt image must be less than 5MB.");
        setReceiptFile(null);
        event.target.value = ''; 
      } else if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        setFormError("Invalid file type. Please upload JPG, PNG, or GIF.");
        setReceiptFile(null);
        event.target.value = '';
      }
      else {
        setReceiptFile(file);
        setFormError(null);
      }
    } else {
      setReceiptFile(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeName || !date || !amount || !vendor || !description) {
      setFormError("Please fill in all required fields.");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError("Please enter a valid positive amount.");
      return;
    }
    setFormError(null);
    onSubmit({
      employeeName,
      date,
      amount: parsedAmount,
      currency,
      vendor,
      category,
      description,
    }, receiptFile);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-brand-surface rounded-xl shadow-2xl space-y-6 border border-brand-border">
      <h2 className="text-2xl font-semibold text-brand-primary mb-6 text-center">Submit Expense Report</h2>
      
      {formError && <p className="text-status-danger-text bg-status-danger-bg border border-status-danger-border p-3 rounded-md">{formError}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="employeeName" className="block text-sm font-medium text-brand-text-base">Employee Name <span className="text-status-danger-text">*</span></label>
          <input type="text" id="employeeName" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} required 
                 className="mt-1 block w-full px-3 py-2 border border-brand-border-input rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-brand-surface text-brand-text-base placeholder-brand-text-muted" />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-brand-text-base">Date of Expense <span className="text-status-danger-text">*</span></label>
          <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required
                 className="mt-1 block w-full px-3 py-2 border border-brand-border-input rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-brand-surface text-brand-text-base placeholder-brand-text-muted custom-date-input" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-brand-text-base">Amount <span className="text-status-danger-text">*</span></label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} required step="0.01" min="0.01"
                   className="flex-1 block w-full min-w-0 px-3 py-2 rounded-none rounded-l-md border-brand-border-input focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-brand-surface text-brand-text-base placeholder-brand-text-muted" />
            <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}
                    className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-brand-border-input bg-brand-surface text-brand-text-base text-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
              <option value="JPY">JPY</option>
              <option value="INR">INR</option>
              <option value="CNY">CNY</option>
              <option value="CHF">CHF</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="vendor" className="block text-sm font-medium text-brand-text-base">Vendor/Merchant <span className="text-status-danger-text">*</span></label>
          <input type="text" id="vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} required
                 className="mt-1 block w-full px-3 py-2 border border-brand-border-input rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-brand-surface text-brand-text-base placeholder-brand-text-muted" />
        </div>
      </div>
      
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-brand-text-base">Category <span className="text-status-danger-text">*</span></label>
        <select id="category" value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)} required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-brand-border-input focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md bg-brand-surface text-brand-text-base">
          {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-brand-text-base">Description/Justification <span className="text-status-danger-text">*</span></label>
        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-brand-border-input rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-brand-surface text-brand-text-base placeholder-brand-text-muted"></textarea>
      </div>

      <div>
        <label htmlFor="receipt" className="block text-sm font-medium text-brand-text-base">Receipt Image (Optional, max 5MB, JPG/PNG/GIF)</label>
        <input type="file" id="receipt" onChange={handleFileChange} accept="image/jpeg,image/png,image/gif"
               className="mt-1 block w-full text-sm text-brand-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/20 dark:file:bg-brand-primary/40 file:text-brand-primary dark:file:text-brand-secondary hover:file:bg-brand-primary/30 dark:hover:file:bg-brand-primary/50"/>
        {receiptFile && <p className="text-xs text-brand-text-muted mt-1">Selected: {receiptFile.name}</p>}
      </div>

      <button type="submit" disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-brand-primary-text bg-brand-primary hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition duration-150">
        {isLoading ? 'Analyzing...' : 'Submit for AI Analysis'}
      </button>
    </form>
  );
};

// Add to your global CSS or a style tag in index.html if you need specific styling for date input calendar icon in dark mode
// For Webkit browsers (Chrome, Safari, Edge)
/*
input[type="date"]::-webkit-calendar-picker-indicator {
    filter: var(--date-picker-indicator-filter, invert(0)); // Default no filter
}
[data-theme="dark"] input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1);
}
*/
// For Firefox, it's harder to style the calendar picker icon directly with CSS.
// It often inherits the `color` property. Ensure text color is appropriate.
// [data-theme="dark"] input[type="date"] { color-scheme: dark; } // might help Firefox somewhat
// For the custom-date-input class, you can add specific styles if needed.
// This is a common challenge with styling native date inputs across browsers.
// Using a custom date picker component is often the most robust solution for full control.
// For now, the class is added as a hook if further specific styling is desired.

