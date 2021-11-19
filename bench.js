import { promises } from 'fs'

import ms from 'pretty-ms'

let config = {
  warmup: 10,
  runs: 100,
  day: process.argv[2] !== undefined ? Number(process.argv[2]) : null,
  part: process.argv[3] !== undefined ? Number(process.argv[3]) : null,
}

async function exec(day) {
  day = `${day}`.padStart(2, '0')
  let data = await promises.readFile(`./data/${day}.txt`, 'utf8')
  let parts = await Promise.all([
    import(`./src/day-${day}/part-1.js`).catch(() => ({ default: null })),
    import(`./src/day-${day}/part-2.js`).catch(() => ({ default: null })),
  ])

  for (let [idx, { default: fn }] of parts.entries()) {
    if (typeof fn !== 'function') continue

    // Skip other parts in case we want to look at a specific part
    if (config.part !== null && config.part - 1 !== idx) continue

    // Warmup
    for (let i = 0; i < config.warmup; i++) {
      fn(data)
    }

    // Let's go!
    let timeTotal = 0
    for (let i = 0; i < config.runs; i++) {
      let start = process.hrtime.bigint()
      fn(data)
      let end = process.hrtime.bigint()

      timeTotal += Number(end - start)
    }

    process.stdout.write(`Day ${day} Part ${idx + 1} - ${ms(timeTotal / config.runs / 1e6, { formatSubMilliseconds: true })}\n`)
  }

  process.stdout.write('\n')
}

console.log()
console.log('Warmup runs:', config.warmup)
console.log(' Total runs:', config.runs)
console.log()

if (config.day !== null) {
  await exec(config.day)
} else {
  let days = (await promises.readdir('./src', { withFileTypes: true })).filter((file) => file.isDirectory()).map((dir) => dir.name.replace('day-', ''))

  for (let day of days) {
    await exec(day)
  }
}

console.log('Done.')
