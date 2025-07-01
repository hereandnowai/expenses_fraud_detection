
import React from 'react';
import { ExpenseAnalysisResult, PolicyViolation, Anomaly, RiskScore } from '../types';

interface AnalysisResultDisplayProps {
  analysis: ExpenseAnalysisResult;
}

const AlertTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
  </svg>
);

const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const InformationCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
  </svg>
);


export const AnalysisResultDisplay: React.FC<AnalysisResultDisplayProps> = ({ analysis }) => {
  const { riskScore, summary, policyViolations, anomaliesDetected, suspiciousLanguage, recommendedAction, isFlagged } = analysis;

  const renderSection = (title: string, items: PolicyViolation[] | Anomaly[], Icon: React.FC<React.SVGProps<SVGSVGElement>>, itemKeyPrefix: string, emptyText: string, itemClassName: string) => {
    if (!items || items.length === 0) {
      return (
         <div className="mt-3">
          <h5 className="text-sm font-semibold text-gray-600 mb-1 flex items-center">
            <Icon className="w-5 h-5 mr-2 text-gray-400" />
            {title}
          </h5>
          <p className="text-xs text-gray-500 italic">{emptyText}</p>
        </div>
      );
    }
    return (
      <div className="mt-3">
        <h5 className="text-sm font-semibold text-gray-600 mb-1 flex items-center">
          <Icon className={`w-5 h-5 mr-2 ${itemClassName === 'text-red-600' ? 'text-red-500' : 'text-yellow-500'}`} />
          {title}
        </h5>
        <ul className="list-disc list-inside space-y-1 pl-2">
          {items.map((item, index) => (
            <li key={`${itemKeyPrefix}-${index}`} className="text-xs text-gray-700">
              <strong>{('policy' in item ? item.policy : item.anomaly)}:</strong> {item.details}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  let riskColorClass = "text-gray-700";
  if (riskScore === RiskScore.High) riskColorClass = "text-red-600";
  else if (riskScore === RiskScore.Medium) riskColorClass = "text-yellow-600";
  else if (riskScore === RiskScore.Low) riskColorClass = "text-green-600";


  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-md font-semibold text-gray-800">AI Analysis Details:</h4>
        <p className={`text-lg font-bold ${riskColorClass}`}>Risk Score: {riskScore}</p>
        <p className="text-sm text-gray-600 italic"><strong>Summary:</strong> {summary}</p>
      </div>

      {isFlagged && (
        <div className="p-3 bg-orange-50 border border-orange-300 rounded-md">
            <p className="text-sm text-orange-700 font-medium flex items-center">
                <AlertTriangleIcon className="w-5 h-5 mr-2" /> This expense has been flagged for review.
            </p>
        </div>
      )}

      {renderSection("Policy Violations", policyViolations, AlertTriangleIcon, "pv", "No policy violations detected.", "text-red-600")}
      {renderSection("Anomalies Detected", anomaliesDetected, InformationCircleIcon, "ad", "No specific anomalies detected.", "text-yellow-600")}

      <div className="mt-3">
        <h5 className="text-sm font-semibold text-gray-600 mb-1 flex items-center">
          <InformationCircleIcon className={`w-5 h-5 mr-2 ${suspiciousLanguage.detected ? 'text-yellow-500' : 'text-gray-400'}`} />
          Suspicious Language Analysis
        </h5>
        {suspiciousLanguage.detected ? (
          <p className="text-xs text-gray-700"><strong>Notes:</strong> {suspiciousLanguage.notes}</p>
        ) : (
          <p className="text-xs text-gray-500 italic">No suspicious language detected.</p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200">
        <h5 className="text-sm font-semibold text-gray-600 mb-1 flex items-center">
            <CheckCircleIcon className="w-5 h-5 mr-2 text-brand-primary" />
            Recommended Action
        </h5>
        <p className="text-sm text-brand-primary font-medium">{recommendedAction}</p>
      </div>
    </div>
  );
};
