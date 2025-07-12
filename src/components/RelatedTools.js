import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

const RelatedTools = ({ currentTool, tools }) => {
  // Get related tools based on categories and functionality
  const getRelatedTools = () => {
    const currentToolData = tools.find(tool => tool.href === `/${currentTool}`)
    if (!currentToolData) return []

    // Define tool relationships
    const relationships = {
      merge: ['split', 'compress', 'watermark', 'protect'],
      split: ['merge', 'pdf-to-jpg', 'compress', 'delete-pages'],
      compress: ['merge', 'split', 'pdf-to-jpg', 'organize'],
      'jpg-to-pdf': ['pdf-to-jpg', 'merge', 'compress', 'watermark'],
      'pdf-to-jpg': ['jpg-to-pdf', 'split', 'compress', 'rotate'],
      protect: ['unlock', 'watermark', 'sign', 'compress'],
      unlock: ['protect', 'merge', 'split', 'compress'],
      watermark: ['protect', 'sign', 'merge', 'compress'],
      sign: ['watermark', 'protect', 'merge', 'form-filler'],
      rotate: ['split', 'merge', 'compress', 'organize'],
      'delete-pages': ['split', 'merge', 'organize', 'reorder'],
      'page-numbers': ['watermark', 'merge', 'organize', 'compress'],
      'reorder': ['organize', 'delete-pages', 'merge', 'split'],
      'organize': ['reorder', 'delete-pages', 'merge', 'split'],
      'html-to-pdf': ['merge', 'compress', 'watermark', 'protect'],
      'ocr': ['form-filler', 'sign', 'merge', 'compress'],
      'form-filler': ['sign', 'ocr', 'protect', 'merge'],
      'word-to-pdf': ['merge', 'compress', 'protect', 'watermark'],
      'pdf-to-word': ['ocr', 'form-filler', 'split', 'compress'],
      'legal-analyzer': ['ocr', 'form-filler', 'protect', 'sign'],
      'medical-analyzer': ['ocr', 'form-filler', 'protect', 'sign']
    }

    const relatedNames = relationships[currentTool] || []
    return tools
      .filter(tool => relatedNames.includes(tool.href.replace('/', '')) && tool.href !== `/${currentTool}`)
      .slice(0, 4) // Show max 4 related tools
  }

  const relatedTools = getRelatedTools()

  if (relatedTools.length === 0) return null

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
        Related PDF Tools
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {relatedTools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group flex items-start p-3 rounded-lg border border-gray-600 hover:border-blue-500 hover:bg-gray-700 transition-all duration-200"
          >
            <div className="flex items-start w-full">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-500 transition-colors flex-shrink-0">
                <span className="text-white text-sm font-medium">
                  📄
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-100 group-hover:text-blue-400 transition-colors text-sm leading-tight">
                  {tool.title}
                </h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  {tool.description}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors flex-shrink-0 ml-2 mt-0.5" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <Link
          href="/"
          className="text-sm text-blue-400 hover:text-blue-300 font-medium inline-flex items-center"
        >
          View all PDF tools
          <ChevronRight className="w-3 h-3 ml-1" />
        </Link>
      </div>
    </div>
  )
}

export default RelatedTools