
import React from 'react';

interface HomePageProps {
  onGetStarted: () => void;
  onViewHistory: () => void;
  hasHistory: boolean;
}

const AiAnalyzeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 13.75l-1.25-1.75L14.25 12l1.5-1.75L17 8.5l1.25 1.75L19.75 12l-1.5 1.75z" />
  </svg>
);

const PolicyCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ReceiptScanIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM10.5 16.5h3.75" />
  </svg>
);

const ReportIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);


const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-brand-secondary/20 hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center mb-3">
      <span className="text-brand-primary mr-3">{icon}</span>
      <h3 className="text-xl font-semibold text-brand-primary">{title}</h3>
    </div>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

export const HomePage: React.FC<HomePageProps> = ({ onGetStarted, onViewHistory, hasHistory }) => {
  return (
    <div className="text-center p-4 md:p-8 max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-brand-primary/10">
      <AiAnalyzeIcon className="w-20 h-20 mx-auto mb-5 text-brand-primary opacity-80" />
      <h2 className="text-4xl font-extrabold text-brand-primary mb-3">Smart Expense Analyzer</h2>
      <p className="text-lg text-gray-700 mb-8 leading-relaxed">
        Leverage the power of AI to automatically detect anomalies, check policy compliance, and streamline your expense report reviews.
        Get instant insights and ensure every expense aligns with company guidelines.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-10 text-left">
        <FeatureCard 
          icon={<AiAnalyzeIcon className="w-8 h-8"/>} 
          title="AI-Powered Analysis" 
          description="Our advanced AI scans expenses for potential fraud, out-of-policy spending, and unusual patterns, providing a risk score for each item."
        />
        <FeatureCard 
          icon={<PolicyCheckIcon className="w-8 h-8"/>} 
          title="Policy Compliance Checks" 
          description="Automatically verifies expenses against your company's policies, highlighting violations and ensuring adherence to spending rules."
        />
        <FeatureCard 
          icon={<ReceiptScanIcon className="w-8 h-8"/>} 
          title="Receipt Analysis (Optional)" 
          description="Upload receipt images for the AI to extract key information like vendor, date, and amount, cross-referencing with submitted data."
        />
        <FeatureCard 
          icon={<ReportIcon className="w-8 h-8"/>} 
          title="Detailed PDF Reports" 
          description="Generate comprehensive PDF reports summarizing all analyzed expenses, risk assessments, and policy violations for easy auditing and record-keeping."
        />
      </div>

      <div className="space-y-4 md:space-y-0 md:flex md:justify-center md:space-x-6">
        <button
          onClick={onGetStarted}
          className="w-full md:w-auto px-10 py-4 bg-brand-primary text-white text-lg font-semibold rounded-lg hover:bg-teal-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
          aria-label="Submit a new expense report"
        >
          Submit New Expense
        </button>
        {hasHistory && (
          <button
            onClick={onViewHistory}
            className="w-full md:w-auto px-10 py-4 bg-brand-secondary text-brand-primary text-lg font-semibold rounded-lg hover:bg-yellow-400 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2"
            aria-label="View previously submitted expense reports"
          >
            View Expense History
          </button>
        )}
      </div>
       {!hasHistory && (
           <p className="text-sm text-gray-500 mt-6">
             No prior expenses found in your history. <br/>Click "Submit New Expense" to get started!
           </p>
        )}
    </div>
  );
};
