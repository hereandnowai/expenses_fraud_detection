
import React from 'react';
import { COMPANY_LOGO_URL, COMPANY_NAME, COMPANY_IMAGE_URL } from '../constants';

type AppView = 'home' | 'form' | 'history';
type Theme = 'light' | 'dark';

interface HeaderProps {
  onNavigate: (view: AppView) => void;
  currentView: AppView;
  currentTheme: Theme;
  onToggleTheme: () => void;
}

const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
);

const MoonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);


export const Header: React.FC<HeaderProps> = ({ onNavigate, currentView, currentTheme, onToggleTheme }) => {
  
  const navLinkBaseClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out";
  const activeNavLinkClasses = "bg-brand-secondary text-brand-secondary-text";
  const inactiveNavLinkClasses = "text-brand-primary-text hover:bg-brand-primary-dark hover:text-brand-secondary";

  return (
    <header className="w-full bg-gradient-to-r from-brand-primary to-brand-primary-dark text-brand-primary-text shadow-lg p-4 sticky top-0 z-50 print:hidden">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        <button 
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition-opacity group"
          aria-label="Navigate to home page"
        >
          <img src={COMPANY_LOGO_URL} alt="Company Logo" className="h-12 w-12 rounded-full border-2 border-brand-secondary group-hover:border-yellow-300 transition-colors" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight group-hover:text-brand-secondary transition-colors">Fraud Detection AI</h1>
            <p className="text-xs text-brand-secondary group-hover:text-white transition-colors">{COMPANY_NAME}</p>
          </div>
        </button>
        
        <div className="flex items-center space-x-2 sm:space-x-4 mt-3 sm:mt-0">
            <nav className="flex space-x-2 sm:space-x-4">
            <button 
                onClick={() => onNavigate('home')} 
                className={`${navLinkBaseClasses} ${currentView === 'home' ? activeNavLinkClasses : inactiveNavLinkClasses}`}
                aria-current={currentView === 'home' ? 'page' : undefined}
            >
                Home
            </button>
            <button 
                onClick={() => onNavigate('form')} 
                className={`${navLinkBaseClasses} ${currentView === 'form' ? activeNavLinkClasses : inactiveNavLinkClasses}`}
                aria-current={currentView === 'form' ? 'page' : undefined}
            >
                Add Expense
            </button>
            <button 
                onClick={() => onNavigate('history')} 
                className={`${navLinkBaseClasses} ${currentView === 'history' ? activeNavLinkClasses : inactiveNavLinkClasses}`}
                aria-current={currentView === 'history' ? 'page' : undefined}
            >
                History
            </button>
            </nav>
            <button
                onClick={onToggleTheme}
                className={`${inactiveNavLinkClasses} ${navLinkBaseClasses} p-2`}
                aria-label={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
                title={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
            >
                {currentTheme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            </button>
            <img src={COMPANY_IMAGE_URL} alt="Company Title Image" className="h-10 hidden md:block" />
        </div>
      </div>
    </header>
  );
};