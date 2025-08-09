#!/usr/bin/env node
/**
 * Final Comprehensive Fix
 * Removes clearly unused imports and variables
 */

const fs = require('fs');
const path = require('path');

const removals = [
  // Remove clearly unused imports
  { file: 'src/app/certificate-generator/page.js', remove: ', Calendar' },
  { file: 'src/app/compress/page.js', remove: 'import { Loader } from "lucide-react";\n' },
  { file: 'src/app/jpg-to-pdf/page.js', remove: ', rgb' },
  { file: 'src/app/jpg-to-pdf/page.js', remove: 'import { Loader } from "lucide-react";\n' },
  
  { file: 'src/app/page.js', remove: 'import Image from "next/image";\n' },
  { file: 'src/app/pdf-to-jpg/page.js', remove: 'import { Loader } from "lucide-react";\n' },
  { file: 'src/app/pricing/page.js', remove: 'import { trackEvent } from "@/lib/analytics";\n' },
  { file: 'src/app/reorder/page.js', remove: ', Card' },
  { file: 'src/app/report-generator/page.js', remove: ', PieChart' },
  { file: 'src/app/sign/page.js', remove: ', StandardFonts' },
  { file: 'src/app/sign/page.js', remove: ', Card' },
  { file: 'src/app/tools/advanced-ocr/page.js', remove: ', Save, Eye' },
  { file: 'src/app/tools/pdf-annotation-collaboration/page.js', remove: ', AvatarImage' },
  { file: 'src/app/tools/pdf-annotation-collaboration/page.js', remove: ', Upload' },
  { file: 'src/app/tools/pdf-bookmark-manager/page.js', remove: ', ChevronRight, ChevronDown, Move' },
  { file: 'src/app/tools/pdf-digital-signature/page.js', remove: ', Upload' },
  { file: 'src/app/tools/pdf-digital-signature/page.js', remove: ', Calendar' },
  { file: 'src/app/tools/pdf-form-creator/page.js', remove: ', CardDescription' },
  { file: 'src/app/tools/pdf-form-creator/page.js', remove: 'import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";\n' },
  { file: 'src/app/tools/pdf-form-creator/page.js', remove: 'import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";\n' },
  { file: 'src/app/tools/pdf-form-creator/page.js', remove: ', Save' },
  { file: 'src/app/tools/pdf-form-creator/page.js', remove: 'import { PDFForm, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown, PDFSignature } from "pdf-lib";\n' },
  { file: 'src/app/tools/pdf-redaction/page.js', remove: ', Upload' },
  { file: 'src/app/tools/pdf-version-comparison/page.js', remove: ', Upload' },
  { file: 'src/app/watermark/page.js', remove: 'import {\n  Select,\n  SelectContent,\n  SelectItem,\n  SelectTrigger,\n  SelectValue,\n} from "@/components/ui/select";\n' }
];

function applyRemovals() {
  console.log('🔧 Removing clearly unused imports and variables...\n');
  
  let fixedCount = 0;
  
  for (const removal of removals) {
    const filePath = path.join(process.cwd(), removal.file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${removal.file}`);
      continue;
    }
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes(removal.remove)) {
        content = content.replace(removal.remove, '');
        // Clean up any resulting empty import lines
        content = content.replace(/import\s*\{\s*\}\s*from[^;]+;?\n?/g, '');
        // Clean up any resulting double commas
        content = content.replace(/,\s*,/g, ',');
        // Clean up trailing commas in imports
        content = content.replace(/,\s*\}/g, ' }');
        // Clean up leading commas in imports
        content = content.replace(/\{\s*,/g, '{');
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed: ${removal.file}`);
        fixedCount++;
      } else {
        console.log(`ℹ️  Pattern not found in: ${removal.file}`);
      }
    } catch (error) {
      console.log(`❌ Error fixing ${removal.file}: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Files fixed: ${fixedCount}`);
  console.log(`📁 Total removals attempted: ${removals.length}`);
}

if (require.main === module) {
  applyRemovals();
}

module.exports = { applyRemovals };