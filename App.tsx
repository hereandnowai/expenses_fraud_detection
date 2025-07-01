
import React, { useState, useCallback, useEffect } from 'react';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { Header } from './components/Header';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SummaryReport } from './components/SummaryReport';
import { AiAssistantButton } from './components/AiAssistantButton';
import { AiAssistantChatWindow } from './components/AiAssistantChatWindow';
import { HomePage } from './components/HomePage';
import { analyzeExpenseWithGemini } from './services/geminiService';
import { generatePdfReport } from './services/pdfService';
import { ExpenseReportEntry } from './types';
import { COMPANY_POLICIES } from './constants';

type AppView = 'home' | 'form' | 'history';
type Theme = 'light' | 'dark';

const saveExpensesToLocalStorage = (expensesToSave: ExpenseReportEntry[]) => {
  try {
    localStorage.setItem('expenseHistory', JSON.stringify(expensesToSave));
  } catch (e) {
    console.warn("Could not save expenses to localStorage. History may not be persisted.", e);
  }
};

const ActionButtons: React.FC<{
    expensesExist: boolean;
    onDownloadPdf: () => void;
    onClearAll: () => void;
    isLoading: boolean;
    isGeneratingPdf: boolean;
}> = ({ expensesExist, onDownloadPdf, onClearAll, isLoading, isGeneratingPdf }) => {
    if (!expensesExist) return null;
    return (
        <div className="flex flex-col sm:flex-row justify-end items-center mb-4 gap-2 print:hidden">
            <button
                onClick={onDownloadPdf}
                className="px-4 py-2 bg-action-green-bg text-white rounded-lg hover:bg-action-green-hover-bg transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || isGeneratingPdf}
                aria-label="Download expense report as PDF"
            >
                Download Report (PDF)
            </button>
            <button
                onClick={() => {
                    if (window.confirm("Are you sure you want to clear all expense history? This action cannot be undone.")) {
                        onClearAll();
                    }
                }}
                className="px-4 py-2 bg-action-red-bg text-white rounded-lg hover:bg-action-red-hover-bg transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || isGeneratingPdf}
                aria-label="Clear all expense history"
            >
                Clear All History
            </button>
        </div>
    );
};


const App: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseReportEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('appTheme') as Theme | null;
    return storedTheme || 'light';
  });

  useEffect(() => {
    const storedExpenses = localStorage.getItem('expenseHistory');
    if (storedExpenses) {
      try {
        const parsedExpenses: ExpenseReportEntry[] = JSON.parse(storedExpenses);
        if (Array.isArray(parsedExpenses)) {
          setExpenses(parsedExpenses);
        } else {
          localStorage.removeItem('expenseHistory');
        }
      } catch (e) {
        console.error("Failed to parse expense history from localStorage", e);
        localStorage.removeItem('expenseHistory');
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('appTheme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleSubmitExpense = useCallback(async (
    newExpenseData: Omit<ExpenseReportEntry, 'id' | 'analysis' | 'receiptImageName' | 'receiptImageDataUrl'>,
    receiptFile: File | null
  ) => {
    setIsLoading(true);
    setError(null);
    setCurrentView('form'); 

    let base64ReceiptImage: string | null = null;
    let receiptMimeType: string | null = null;
    let receiptDataUrl: string | undefined = undefined;

    if (receiptFile) {
      try {
        const reader = new FileReader();
        const promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });
        reader.readAsDataURL(receiptFile);
        const dataUrlFromFile = await promise;
        receiptDataUrl = dataUrlFromFile;
        base64ReceiptImage = dataUrlFromFile.split(',')[1];
        receiptMimeType = receiptFile.type;
      } catch (e) {
        console.error("Error processing receipt image:", e);
        setError("Failed to process receipt image. Please try again.");
        setIsLoading(false);
        return;
      }
    }
    
    const newExpenseEntry: ExpenseReportEntry = {
      ...newExpenseData,
      id: Date.now().toString(),
      receiptImageName: receiptFile ? receiptFile.name : undefined,
      receiptImageDataUrl: receiptDataUrl,
      analysis: null,
    };

    let analyzedExpense = newExpenseEntry;

    try {
      const expenseForAnalysis: Omit<ExpenseReportEntry, 'id' | 'analysis' | 'receiptImageName' | 'receiptImageDataUrl'> = {
        ...newExpenseData
      };
      const analysisResult = await analyzeExpenseWithGemini(
        expenseForAnalysis,
        COMPANY_POLICIES,
        base64ReceiptImage,
        receiptMimeType
      );
      analyzedExpense = { ...newExpenseEntry, analysis: analysisResult };
    } catch (e: any) {
      console.error("Error analyzing expense:", e);
      setError(e.message || "An error occurred while analyzing the expense.");
    } finally {
      setExpenses(prevExpenses => {
        const updatedExpenses = [analyzedExpense, ...prevExpenses];
        saveExpensesToLocalStorage(updatedExpenses);
        return updatedExpenses;
      });
      setIsLoading(false);
    }
  }, []);

  const handleClearAll = () => {
    setExpenses([]);
    try {
        localStorage.removeItem('expenseHistory');
    } catch (e) {
        console.warn("Could not clear expense history from localStorage.", e);
    }
    setError(null);
    setCurrentView('home'); 
  };

  const handleDownloadPdf = async () => {
    if (expenses.length === 0) return;
    setIsGeneratingPdf(true);
    try {
      await generatePdfReport(expenses); 
    } catch (e: any)
{
      console.error("Error generating PDF:", e);
      setError("Failed to generate PDF report. Please try again. Error: " + e.message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    setError(null); 
  };

  const toggleChatWindow = () => {
    setIsChatOpen(prev => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-brand-bg-base to-brand-bg-gradient-end text-brand-text-base transition-colors duration-300">
      <Header onNavigate={handleNavigate} currentView={currentView} currentTheme={theme} onToggleTheme={toggleTheme} />
      <main className="container mx-auto p-4 md:p-8 w-full max-w-5xl flex-grow">

        {currentView === 'home' && (
            <HomePage 
                onGetStarted={() => handleNavigate('form')}
                onViewHistory={() => handleNavigate('history')}
                hasHistory={expenses.length > 0}
            />
        )}

        {currentView === 'form' && (
          <div className="w-full">
            <ExpenseForm onSubmit={handleSubmitExpense} isLoading={isLoading} />
            {error && (
              <div className="mt-6 p-4 bg-status-danger-bg border border-status-danger-border text-status-danger-text rounded-md shadow-md" role="alert">
                <h3 className="font-bold text-lg">Error</h3>
                <p>{error}</p>
              </div>
            )}
            {expenses.length > 0 && !isGeneratingPdf && (
              <div className="mt-8">
                <ActionButtons 
                    expensesExist={expenses.length > 0}
                    onDownloadPdf={handleDownloadPdf}
                    onClearAll={handleClearAll}
                    isLoading={isLoading}
                    isGeneratingPdf={isGeneratingPdf}
                />
                <SummaryReport expenses={expenses} />
                <ExpenseList expenses={expenses} />
              </div>
            )}
            {expenses.length === 0 && !isLoading && !error && (
                 <div className="mt-10 p-8 bg-brand-surface rounded-xl shadow-lg text-center border border-brand-border">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 mx-auto text-brand-text-muted mb-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <h3 className="text-xl font-medium text-brand-text-heading">No Expenses Yet</h3>
                    <p className="text-sm text-brand-text-muted">Fill out the form above to submit your first expense for analysis.</p>
                 </div>
            )}
          </div>
        )}
        
        {currentView === 'history' && (
           <div className="w-full mt-2">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
                <h2 className="text-3xl font-bold text-brand-primary">Expense History</h2>
            </div>
            {expenses.length === 0 ? (
                <div className="text-center py-10 bg-brand-surface rounded-xl shadow-xl border border-brand-secondary/20">
                    <svg className="mx-auto h-16 w-16 text-brand-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <h3 className="mt-2 text-xl font-semibold text-brand-text-heading">No Past Expenses</h3>
                    <p className="mt-1 text-md text-brand-text-muted">Your submitted expenses will appear here.</p>
                    <div className="mt-6">
                        <button
                            type="button"
                            onClick={() => handleNavigate('form')}
                            className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-md font-medium rounded-lg text-brand-primary-text bg-brand-primary hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                        >
                            Submit Your First Expense
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <ActionButtons 
                        expensesExist={expenses.length > 0}
                        onDownloadPdf={handleDownloadPdf}
                        onClearAll={handleClearAll}
                        isLoading={isLoading}
                        isGeneratingPdf={isGeneratingPdf}
                    />
                    <SummaryReport expenses={expenses} />
                    <ExpenseList expenses={expenses} />
                </>
            )}
           </div>
        )}

      </main>

      {(isLoading || isGeneratingPdf) && <LoadingSpinner message={isGeneratingPdf ? "Generating PDF report..." : "AI is analyzing the expense..."} />}

      <AiAssistantButton onToggleChat={toggleChatWindow} />
      {isChatOpen && <AiAssistantChatWindow onClose={toggleChatWindow} />}

      <footer className="w-full text-center p-4 mt-auto text-sm text-brand-text-muted print:hidden">
        Powered by RASHINI S [AI Products Engineering Team]
      </footer>
    </div>
  );
};

export default App;
