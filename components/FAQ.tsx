import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How do I generate a new Agri Record card?",
    answer: "You can generate a new card by filling out the form on the home page with the required details such as Farmer Name, Father/Husband Name, Address, and Land Details. Once the form is complete, you will need to purchase credits via WhatsApp to finalize the creation."
  },
  {
    question: "Why is the payment gateway not working?",
    answer: "Our direct payment gateway is currently disabled for security reasons. To purchase credits for generating cards, please contact our support team directly via WhatsApp at +91 70702 00199."
  },
  {
    question: "How can I contact the support team?",
    answer: "You can reach out to our support team via WhatsApp at +91 70702 00199 or email us at ajnabicreation@gmail.com. Our support hours are Monday to Friday, 10:00 AM - 6:00 PM IST."
  },
  {
    question: "Is this an official government document?",
    answer: "No, Agri Record is an independent private platform. The cards generated are for personal, informational, or record-keeping purposes only and do not serve as official government identification."
  },
  {
    question: "Can I edit a card after generating it?",
    answer: "Yes, you can manage and edit your generated cards from the 'My Cards' section if you are logged into your account."
  }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4 no-print">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center p-2 bg-emerald-100 text-emerald-600 rounded-full mb-3">
          <HelpCircle className="w-5 h-5" />
        </div>
        <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-2">Frequently Asked Questions</h2>
        <p className="text-slate-600 font-medium text-sm md:text-base max-w-xl mx-auto">
          Quick answers to common questions about using the Agri Record generator and getting support.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className={`border rounded-xl overflow-hidden transition-all duration-200 ${openIndex === index ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
          >
            <button
              className="w-full px-4 py-3 flex items-center justify-between text-left focus:outline-none"
              onClick={() => toggleFAQ(index)}
            >
              <span className={`font-bold text-sm md:text-base pr-4 ${openIndex === index ? 'text-emerald-700' : 'text-slate-800'}`}>
                {faq.question}
              </span>
              <div className={`shrink-0 transition-transform duration-200 ${openIndex === index ? 'rotate-180 text-emerald-600' : 'text-slate-400'}`}>
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>
            <div 
              className={`px-4 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'pb-4 opacity-100 max-h-40' : 'max-h-0 opacity-0 pb-0'}`}
            >
              <p className="text-slate-600 leading-relaxed text-xs md:text-sm">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
