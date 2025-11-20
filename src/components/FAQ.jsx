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
          className="border border-border overflow-hidden transition-all duration-200 hover:border-border"
          itemScope
          itemType="https://schema.org/Question"
        >
          <button
            onClick={() => toggleItem(index)}
            className="w-full px-5 py-4 text-left bg-background hover:bg-background transition-colors duration-200 flex items-center justify-between"
            aria-expanded={openItems.has(index)}
          >
            <h4 
              className="text-lg font-semibold text-foreground pr-4"
              itemProp="name"
            >
              {faq.question}
            </h4>
            {openItems.has(index) ? (
              <ChevronUp className="w-5 h-5 text-foreground flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-foreground flex-shrink-0" />
            )}
          </button>
          {openItems.has(index) && (
            <div 
              className="px-5 py-4 bg-background border-t border-border animate-fade-in"
              itemScope
              itemType="https://schema.org/Answer"
            >
              <p 
                className="text-foreground leading-relaxed"
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