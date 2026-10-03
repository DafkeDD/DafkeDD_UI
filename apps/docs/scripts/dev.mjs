// Start Next in dev- of start-modus op de eerste vrije poort vanaf 3000.
// 3000 bezet? Dan 3001, dan 3002, ... tot en met 4000.
// Poort vastzetten kan met PORT=1234 npm run dev.
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'

const MIN = 3000
const MAX = 4000

const mode = process.argv[2] === 'start' ? 'start' : 'dev'

// Next bindt op alle interfaces (::), dus testen we hier ook zonder host —
// een check op alleen 127.0.0.1 zou een bezette poort als vrij zien.
function isVrij(poort) {
  return new Promise((resolve) => {
    const server = createServer()
    server.once('error', () => resolve(false))
    server.listen(poort, () => server.close(() => resolve(true)))
  })
}

async function kiesPoort() {
  if (process.env.PORT) return Number(process.env.PORT)
  for (let poort = MIN; poort <= MAX; poort++) {
    if (await isVrij(poort)) return poort
  }
  throw new Error(`Geen vrije poort gevonden tussen ${MIN} en ${MAX}.`)
}

const poort = await kiesPoort()
console.log(`\n▸ ${mode === 'dev' ? 'Documentatiesite' : 'Productiebuild'} op http://localhost:${poort}\n`)

const nextBin = createRequire(import.meta.url).resolve('next/dist/bin/next')
const kind = spawn(process.execPath, [nextBin, mode, '-p', String(poort)], { stdio: 'inherit' })
kind.on('exit', (code, signal) => {
  // Gestopt door een signaal telt niet als fout (Ctrl+C, of de UI-test die afsluit).
  process.exit(signal ? 0 : code ?? 0)
})

// Signalen doorgeven aan Next: anders blijft de server als wees draaien wanneer
// dit script gestopt wordt (bv. door scripts/ui-test.mjs of Ctrl+C).
for (const signaal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signaal, () => {
    if (!kind.killed) kind.kill(signaal)
  })
}
