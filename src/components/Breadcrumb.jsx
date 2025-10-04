import React from 'react'
import { ChevronRight } from 'lucide-react'

const Breadcrumb = ({ items }) => {
  if (!items || items.length === 0) {
    return null
  }

  return (
    <nav 
      className="flex items-center space-x-2 text-sm text-gray-400 container-standard"
      aria-label="Breadcrumb"
      itemScope
      itemType="https://schema.org/BreadcrumbList"
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <div
            itemScope
            itemType="https://schema.org/ListItem"
            itemProp="itemListElement"
          >
            {index === items.length - 1 ? (
              <span 
                className="text-gray-300 font-medium"
                itemProp="name"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <a
                href={item.href}
                className="text-gray-400 hover:text-gray-300 transition-colors duration-200 hover:underline"
                itemProp="item"
              >
                <span itemProp="name">{item.label}</span>
              </a>
            )}
            <meta itemProp="position" content={index + 1} />
          </div>
        </React.Fragment>
      ))}
    </nav>
  )
}

export default Breadcrumb