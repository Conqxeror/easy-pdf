"use client";

import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const FAQ = ({ faqs }) => {
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

  if (!faqs || faqs.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="border border-gray-600 overflow-hidden transition-all duration-200 hover:border-gray-500"
          itemScope
          itemType="https://schema.org/Question"
        >
          <button
            onClick={() => toggleItem(index)}
            className="w-full px-5 py-4 text-left bg-gray-950 hover:bg-gray-950 transition-colors duration-200 flex items-center justify-between"
            aria-expanded={openItems.has(index)}
          >
            <h4 
              className="text-lg font-semibold text-white pr-4"
              itemProp="name"
            >
              {faq.question}
            </h4>
            {openItems.has(index) ? (
              <ChevronUp className="w-5 h-5 text-gray-300 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-300 flex-shrink-0" />
            )}
          </button>
          {openItems.has(index) && (
            <div 
              className="px-5 py-4 bg-gray-950 border-t border-gray-600 animate-fade-in"
              itemScope
              itemType="https://schema.org/Answer"
            >
              <p 
                className="text-gray-300 leading-relaxed"
                itemProp="text"
              >
                {faq.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default FAQ