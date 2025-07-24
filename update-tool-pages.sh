#!/bin/bash

# Script to update all tool pages with enhanced ToolPageContent

# Array of tools with their names
declare -A tools=(
    ["compress"]="Compress PDF"
    ["jpg-to-pdf"]="JPG to PDF"
    ["pdf-to-jpg"]="PDF to JPG"
    ["protect"]="Protect PDF"
    ["unlock"]="Unlock PDF"
    ["watermark"]="Watermark PDF"
    ["sign"]="Sign PDF"
    ["rotate"]="Rotate PDF"
    ["page-numbers"]="Add Page Numbers"
    ["delete-pages"]="Delete Pages"
    ["reorder"]="Reorder Pages"


    ["html-to-pdf"]="HTML to PDF"
    ["organize"]="Organize PDF"
    ["ocr"]="OCR PDF"
    ["form-filler"]="Fill PDF Forms"
)

echo "Updating tool pages with enhanced ToolPageContent..."

for tool in "${!tools[@]}"; do
    tool_file="src/app/$tool/page.js"
    
    if [ -f "$tool_file" ]; then
        echo "Updating $tool_file..."
        
        # Add currentTool parameter to ToolPageContent
        sed -i "s/toolDescription=\"\([^\"]*\)\"/toolDescription=\"\1\"\n          currentTool=\"$tool\"/g" "$tool_file"
        
        # Remove faqs prop if it exists (since we'll use enhanced FAQs)
        sed -i '/faqs={\[/,/\]}/d' "$tool_file"
        
        echo "✓ Updated $tool"
    else
        echo "⚠ File not found: $tool_file"
    fi
done

echo "✅ Tool page updates completed!"