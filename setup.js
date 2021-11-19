import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

let day = process.argv[2]

if (!day) throw new Error('Usage: yarn setup <day>')
day = day.padStart(2, '0')

function data(...paths) {
  return path.resolve(process.cwd(), 'data', ...paths)
}

function dest(...paths) {
  return path.resolve(process.cwd(), 'src', `day-${day}`, ...paths)
}

function template(...paths) {
  return path.resolve(process.cwd(), 'template', ...paths)
}

if (fs.existsSync(dest())) {
  throw new Error(`Watch out! "day-${day}" already exists!`)
}

await fs.promises.mkdir(dest(), { recursive: true })

// Copy the files from the template
let templateFiles = await fs.promises.readdir(template())
await Promise.all(
  templateFiles.map((file) => {
    return fs.promises.copyFile(template(file), dest(file))
  })
)

// Replace the constants
let replacements = {
  'index.test.js': {
    DAY: day,
  },
}
for (let file in replacements) {
  let contents = await fs.promises.readFile(dest(file), 'utf8')
  for (let [key, value] of Object.entries(replacements[file])) {
    contents = contents.replace(new RegExp(`{{${key}}}`, 'g'), value)
  }
  await fs.promises.writeFile(dest(file), contents, 'utf8')
}

// Get the data for the next day
let response = await fetch(`https://adventofcode.com/2021/day/${Number(day)}/input`, {
  headers: {
    cookie: process.env.AOC_COOKIE,
  },
})
let contents = await response.text()

await fs.promises.writeFile(data(`${day}.txt`), contents, 'utf8')
