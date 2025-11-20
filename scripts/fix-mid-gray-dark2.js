const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')

function walk(dir) {
  const results = []
  const list = fs.readdirSync(dir)
  list.forEach((file) => {
    const full = path.join(dir, file)
    const stat = fs.statSync(full)
    if (stat && stat.isDirectory()) {
      results.push(...walk(full))
    } else {
      results.push(full)
    }
  })
  return results
}

const exts = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'])
const files = walk(path.join(root, 'src')).filter((f) => exts.has(path.extname(f)))

const darkMarkers = [
  'text-white', 'text-gray-100', 'text-gray-200', 'text-gray-300',
  'dark:', 'dark:hover', 'dark:bg', 'dark:border', 'bg-gray-950', 'bg-black',
  'border-gray-600', 'border-gray-700', 'shadow', 'peer-data', 'data-[state=active]', 'hover:bg-gray-600', 'hover:bg-gray-700'
]

let changed = []

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8')

  const lines = content.split(/\r?\n/)
  let modified = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!/bg-gray-(600|700)/.test(line)) continue
    // if the line or surrounding context contains dark markers, replace
    const window = lines.slice(Math.max(0, i - 3), Math.min(lines.length, i + 3)).join(' ')
    const isDarkContext = darkMarkers.some(m => window.includes(m))
    if (!isDarkContext) continue

    let newLine = line
    newLine = newLine.replace(/bg-gray-700/g, 'bg-gray-950')
    newLine = newLine.replace(/bg-gray-600/g, 'bg-gray-950')
    newLine = newLine.replace(/hover:bg-gray-600/g, 'hover:bg-gray-950')
    newLine = newLine.replace(/hover:bg-gray-700/g, 'hover:bg-gray-950')

    if (newLine !== line) {
      lines[i] = newLine
      modified = true
    }
  }

  if (modified) {
    fs.writeFileSync(file, lines.join('\n'), 'utf8')
    changed.push(path.relative(root, file))
  }
}

console.log('Mid-gray dark2 pass complete. Files changed:', changed.length)
if (changed.length) console.log(changed.join('\n'))
