import React from "react";
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { generateBreadcrumbSchema } from '@/lib/structuredData'

export default function Breadcrumb({ items = [] }) {
  const breadcrumbItems = [
    { name: 'Home', url: 'https://easy-pdf-murex.vercel.app' },
    ...items
  ]

  const structuredData = generateBreadcrumbSchema(breadcrumbItems)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li>
            <Link 
              href="/" 
              className="flex items-center hover:text-gray-400 transition-colors"
              aria-label="Go to homepage"
            >
              <Home className="w-4 h-4" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              <ChevronRight className="w-4 h-4 mx-2 text-gray-600" />
              {index === items.length - 1 ? (
                <span className="text-gray-200 font-medium" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link 
                  href={item.url} 
                  className="hover:text-gray-400 transition-colors"
                  aria-label={`Go to ${item.name}`}
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}