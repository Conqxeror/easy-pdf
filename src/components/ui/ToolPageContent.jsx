
import React from 'react';

const ToolPageContent = ({ toolName, toolDescription, steps, faqs }) => {
  return (
    <div className="bg-gray-900 text-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-extrabold text-center text-white mb-6">{`How to ${toolName} Online for Free`}</h2>
        <p className="text-lg text-center text-gray-400 mb-12">{toolDescription}</p>

        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">How to {toolName}</h3>
            <ol className="list-decimal list-inside space-y-4 text-gray-300">
              {steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white mb-4">Frequently Asked Questions</h3>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index}>
                  <h4 className="text-xl font-semibold text-white">{faq.question}</h4>
                  <p className="text-gray-400 mt-2">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolPageContent;
