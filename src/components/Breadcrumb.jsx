import React from 'react'
import { ChevronRight } from 'lucide-react'

const Breadcrumb = ({ items }) => {
  const normalizedItems = (Array.isArray(items) ? items : [])
    .map((item) => ({
      label: item?.label || item?.name,
      href: item?.href || item?.url,
    }))
    .filter((item) => item.label && item.href)

  if (normalizedItems.length === 0) {
    return null
  }

  return (
    <nav 
      className="flex items-center space-x-2 text-sm text-foreground container-standard"
      aria-label="Breadcrumb"
      itemScope
      itemType="https://schema.org/BreadcrumbList"
    >
      {normalizedItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-foreground" />
          )}
          <div
            itemScope
            itemType="https://schema.org/ListItem"
            itemProp="itemListElement"
          >
            {index === normalizedItems.length - 1 ? (
              <span 
                className="text-foreground font-medium"
                itemProp="name"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <a
                href={item.href}
                className="text-foreground hover:text-foreground transition-colors duration-200 hover:underline"
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