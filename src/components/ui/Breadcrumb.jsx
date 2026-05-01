import React from "react";
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { generateBreadcrumbSchema } from '@/lib/structuredData'
import { resolveSiteUrl } from '@/lib/siteUrl'

export default function Breadcrumb({ items = [] }) {
  const siteUrl = resolveSiteUrl()
  const normalizedItems = items
    .map((item) => ({
      name: item?.name || item?.label,
      url: item?.url || item?.href,
    }))
    .filter((item) => item.name && item.url)

  const breadcrumbItems = [
    { name: 'Home', url: siteUrl },
    ...normalizedItems
  ]

  const structuredData = generateBreadcrumbSchema(breadcrumbItems)

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-foreground">
          <li>
            <Link 
              href="/" 
              className="flex items-center hover:text-foreground transition-colors"
              aria-label="Go to homepage"
            >
              <Home className="w-4 h-4" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
          {normalizedItems.map((item, index) => (
            <li key={index} className="flex items-center">
              <ChevronRight className="w-4 h-4 mx-2 text-foreground" />
              {index === normalizedItems.length - 1 ? (
                <span className="text-foreground font-medium" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link 
                  href={item.url} 
                  className="hover:text-foreground transition-colors"
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