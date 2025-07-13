#!/usr/bin/env node
/**
 * Comprehensive Unused Variable Fixer
 * Fixes all remaining unused variable warnings
 */

const fs = require('fs');
const path = require('path');

function fixFile(filePath, fixes) {
  if (!fs.existsSync(filePath)) {
    return false;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    for (const fix of fixes) {
      if (content.includes(fix.search)) {
        content = content.replace(new RegExp(fix.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.replace);
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
  } catch (error) {
    console.log(`❌ Error fixing ${filePath}: ${error.message}`);
  }
  
  return false;
}

function main() {
  console.log('🔧 Applying comprehensive fixes for all unused variables...\n');
  
  const fixes = [
    // Fix sponsor-dashboard duplicate imports
    {
      file: 'src/app/sponsor-dashboard/page.js',
      fixes: [
        {
          search: 'import React from "react";\nimport { useState, useEffect } from "react";\nimport React, { useState, useEffect } from "react";',
          replace: 'import React, { useState, useEffect } from "react";'
        }
      ]
    },
    
    // Fix utils.js error handling
    {
      file: 'src/lib/utils.js',
      fixes: [
        {
          search: '  } catch (_e) {\n    console.error("Error applying custom styles:", e);',
          replace: '  } catch (e) {\n    console.error("Error applying custom styles:", e);'
        },
        {
          search: '  } catch (e) {\n    return null;',
          replace: '  } catch {\n    return null;'
        },
        {
          search: '    } catch (error) {\n      console.error("Error getting file info:", error);',
          replace: '    } catch (error) {\n      console.error("Error getting file info:", error);'
        }
      ]
    },
    
    // Fix userPreferences.js error handling  
    {
      file: 'src/lib/userPreferences.js',
      fixes: [
        {
          search: '    } catch (_error) {\n      console.error("Error saving preferences:", error);',
          replace: '    } catch (error) {\n      console.error("Error saving preferences:", error);'
        },
        {
          search: '    } catch (error) {\n      console.error("Error loading preferences:", error);',
          replace: '    } catch {\n      console.error("Error loading preferences");'
        }
      ]
    },
    
    // Fix enhancedUX.js error handling
    {
      file: 'src/lib/enhancedUX.js',
      fixes: [
        {
          search: '      } catch (error) {\n        console.error("Error in error handling:", error);',
          replace: '      } catch (error) {\n        console.error("Error in error handling:", error);'
        },
        {
          search: '        } catch (fallbackError) {\n          console.error("Critical error in fallback:", fallbackError);',
          replace: '        } catch (fallbackError) {\n          console.error("Critical error in fallback:", fallbackError);'
        }
      ]
    },
    
    // Fix fileHistory.js
    {
      file: 'src/lib/fileHistory.js',
      fixes: [
        {
          search: '        } catch (_error) {',
          replace: '        } catch {'
        }
      ]
    }
  ];
  
  let fixedCount = 0;
  
  for (const fileConfig of fixes) {
    const filePath = path.join(process.cwd(), fileConfig.file);
    if (fixFile(filePath, fileConfig.fixes)) {
      console.log(`✅ Fixed: ${fileConfig.file}`);
      fixedCount++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Files fixed: ${fixedCount}`);
}

if (require.main === module) {
  main();
}

module.exports = { main };