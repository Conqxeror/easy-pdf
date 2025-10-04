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
  'dark:', 'text-white', 'text-gray-100', 'text-gray-200', 'text-gray-300',
  'bg-gray-950', 'bg-black', 'border-gray-700', 'shadow', 'shadow-lg', 'shadow-xl', 'peer-data', 'data-[state=active]', 'hover:bg-gray-600', 'hover:bg-gray-700'
]

let changed = []

for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
  let modified = false
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    if (!/bg-gray-(600|700)/.test(line)) continue

    const window = lines.slice(Math.max(0, i-4), Math.min(lines.length, i+4)).join(' ')
    const isDarkContext = darkMarkers.some(m => window.includes(m))
    if (!isDarkContext) continue

    const newLine = line.replace(/bg-gray-700/g, 'bg-gray-950').replace(/bg-gray-600/g, 'bg-gray-950').replace(/hover:bg-gray-600/g, 'hover:bg-gray-950').replace(/hover:bg-gray-700/g, 'hover:bg-gray-950')
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

console.log('Final mid-gray pass complete. Files changed:', changed.length)
if (changed.length) console.log(changed.join('\n'))
