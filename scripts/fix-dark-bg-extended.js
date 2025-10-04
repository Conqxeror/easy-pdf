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

const replacements = [
  // dark-prefixed -> use dark:bg-black
  { from: /dark:bg-gray-900(\/\d{1,3})?/g, to: (m, p1) => `dark:bg-black${p1 || ''}` },
  { from: /dark:bg-gray-800(\/\d{1,3})?/g, to: (m, p1) => `dark:bg-black${p1 || ''}` },
  // normal with suffix -> preserve suffix
  { from: /bg-gray-900(\/\d{1,3})/g, to: (m, p1) => `bg-black/${p1.replace('/', '')}` },
  { from: /bg-gray-800(\/\d{1,3})/g, to: (m, p1) => `bg-gray-950/${p1.replace('/', '')}` },
  // plain replacements
  { from: /bg-gray-900/g, to: 'bg-black' },
  { from: /bg-gray-800/g, to: 'bg-gray-950' },
]

let changedFiles = []

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8')
  let original = content
  for (const r of replacements) {
    if (typeof r.to === 'function') {
      content = content.replace(r.from, r.to)
    } else {
      content = content.replace(r.from, r.to)
    }
  }
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8')
    changedFiles.push(path.relative(root, file))
  }
}

console.log('Fix script complete. Files changed:', changedFiles.length)
if (changedFiles.length) console.log(changedFiles.join('\n'))
