#!/usr/bin/env node
/**
 * Manual Unused Variable Fixer
 * Fixes specific unused variables that were identified in the lint output
 */

const fs = require('fs');
const path = require('path');

const fixes = [
  // toolData.js - remove unused imports
  {
    file: 'src/lib/toolData.js',
    search: 'import { FileText, Merge, Split, Minimize2, RotateCw, Stamp, Lock, Unlock, Text, ListOrdered, Eraser, PlusCircle, Signature, FileBadge2, Image as LucideImage, FileCode, FileType, Search, FileHeart, Settings, BookOpen, Bookmark, Table, Layers, CheckCircle, Shield, EyeOff, GitCompare, MessageSquare, Calculator, QrCode, Award, Briefcase } from "lucide-react";',
    replace: 'import { FileText, Merge, Split, Minimize2, RotateCw, Stamp, Lock, Unlock, Text, ListOrdered, Eraser, PlusCircle, Signature, FileBadge2, Image as LucideImage, Search, FileHeart, Settings, Bookmark, Table, Layers, CheckCircle, Shield, EyeOff, GitCompare, MessageSquare, Calculator, QrCode, Award, Briefcase } from "lucide-react";'
  },
  // utils.js - fix unused error variables
  {
    file: 'src/lib/utils.js',
    search: '  } catch (e) {',
    replace: '  } catch (_e) {'
  },
  {
    file: 'src/lib/utils.js',
    search: '    } catch (error) {',
    replace: '    } catch (_error) {'
  },
  // enhancedUX.js - fix unused error variables
  {
    file: 'src/lib/enhancedUX.js',
    search: '      } catch (error) {',
    replace: '      } catch (_error) {'
  },
  {
    file: 'src/lib/enhancedUX.js',
    search: '        } catch (fallbackError) {',
    replace: '        } catch (_fallbackError) {'
  },
  // userPreferences.js - fix unused error variable
  {
    file: 'src/lib/userPreferences.js',
    search: '    } catch (error) {',
    replace: '    } catch (_error) {'
  }
];

function applyFixes() {
  console.log('🔧 Applying manual fixes for unused variables...\n');
  
  let fixedCount = 0;
  
  for (const fix of fixes) {
    const filePath = path.join(process.cwd(), fix.file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${fix.file}`);
      continue;
    }
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes(fix.search)) {
        content = content.replace(fix.search, fix.replace);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed: ${fix.file}`);
        fixedCount++;
      } else {
        console.log(`ℹ️  Pattern not found in: ${fix.file}`);
      }
    } catch (error) {
      console.log(`❌ Error fixing ${fix.file}: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Files fixed: ${fixedCount}`);
  console.log(`📁 Total fixes attempted: ${fixes.length}`);
}

if (require.main === module) {
  applyFixes();
}

module.exports = { applyFixes };