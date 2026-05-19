import { mockTransactions } from "../src/lib/data"
import { env } from "../src/server/config/env"
import { prisma } from "../src/server/db/prisma"
import { ingestTransactionMemory } from "../src/server/cognimemo/client"
import { isCognimemoConfigured } from "../src/server/config/env"
import { upsertTransactions } from "../src/server/transactions/repository"

async function main() {
  console.log(`Seeding transactions for user: ${env.felloUserId}`)
  const count = await upsertTransactions(mockTransactions, env.felloUserId)
  console.log(`Upserted ${count} transactions into SQLite.`)

  if (isCognimemoConfigured()) {
    console.log("Ingesting memories into CogniMemo...")
    let ok = 0
    let fail = 0
    for (const tx of mockTransactions) {
      const result = await ingestTransactionMemory(tx)
      if (result.ok) ok++
      else fail++
    }
    console.log(`CogniMemo ingest: ${ok} ok, ${fail} failed`)
  } else {
    console.log("CogniMemo not configured — skipping memory ingest.")
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
