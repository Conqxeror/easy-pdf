import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { generateJsonLd } from '@/lib/structuredData'

export default function FAQ({ faqs = [], title = "Frequently Asked Questions" }) {
  const [openItems, setOpenItems] = useState(new Set())

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      newOpenItems.add(index)
    }
    setOpenItems(newOpenItems)
  }

  const structuredData = generateJsonLd('faq', { faqs })

  if (faqs.length === 0) return null

  return (
    <section className="w-full max-w-4xl mx-auto mt-12 mb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <h2 className="text-2xl font-bold text-gray-100 mb-6 text-center">
        {title}
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-750 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-expanded={openItems.has(index)}
              aria-controls={`faq-answer-${index}`}
            >
              <h3 className="text-lg font-medium text-gray-100 pr-4">
                {faq.question}
              </h3>
              {openItems.has(index) ? (
                <ChevronUp className="w-5 h-5 text-blue-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-blue-400 flex-shrink-0" />
              )}
            </button>
            {openItems.has(index) && (
              <div 
                id={`faq-answer-${index}`}
                className="px-6 pb-4 text-gray-300 leading-relaxed"
              >
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}