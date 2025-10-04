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

let changed = []

for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
  let modified = false
  const out = lines.map((line) => {
    // Only operate on lines that appear to be className strings or UI tokens and indicate dark mode or dark text
    if (!/bg-gray-(600|700)/.test(line)) return line
    // Heuristics: if line contains dark: token or text-white/text-gray-100 or dark:hover etc.
    if (!/(dark:|text-white|text-gray-100|dark:hover|dark:bg|dark:border)/.test(line)) return line

    let newLine = line
    // Replace hover variants first
    newLine = newLine.replace(/dark:hover:bg-gray-700/g, 'dark:hover:bg-black/60')
    newLine = newLine.replace(/hover:bg-gray-700/g, 'hover:bg-gray-950')

    // Replace plain bg-gray-700/600 with bg-gray-950 or bg-black where appropriate
    newLine = newLine.replace(/bg-gray-700/g, 'bg-gray-950')
    newLine = newLine.replace(/bg-gray-600/g, 'bg-gray-950')

    // Replace border-gray-600 used in dark contexts to border-gray-600 (keep) — leave borders alone

    if (newLine !== line) {
      modified = true
    }
    return newLine
  })

  if (modified) {
    fs.writeFileSync(file, out.join('\n'), 'utf8')
    changed.push(path.relative(root, file))
  }
}

console.log('Mid-gray fix complete. Files changed:', changed.length)
if (changed.length) console.log(changed.join('\n'))
