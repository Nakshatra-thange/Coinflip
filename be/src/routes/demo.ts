import { Hono } from 'hono'
import { prisma } from "../../db"
const demo = new Hono()

demo.post('/initialize', async (c) => {
  const { walletAddress } = await c.req.json()

  let user = await prisma.demoUser.findUnique({
    where: { walletAddress },
  })

  if (!user) {
    user = await prisma.demoUser.create({
      data: {
        walletAddress,
        balance: 3.0,
      },
    })
  }

  return c.json({ balance: user.balance })
})

demo.post('/place-bet', async (c) => {
  const { walletAddress, betAmount } = await c.req.json()

  const allowedBets = [0.1, 0.3, 0.5, 1.0]
  if (!allowedBets.includes(betAmount)) {
    return c.json({ error: 'Invalid bet amount' }, 400)
  }
  
  const user = await prisma.demoUser.findUnique({
    where: { walletAddress },
  })

  if (!user) {
    return c.json({ error: 'User not initialized' }, 404)
  }

  if (Number(user.balance) < betAmount) {
    return c.json({ error: 'Insufficient balance' }, 400)
  }

  const balanceBefore = Number(user.balance)

  const result = Math.random() < 0.5 ? 'heads' : 'tails'
  const won = result === "heads"

  const balanceAfter = won
    ? balanceBefore + betAmount
    : balanceBefore - betAmount

  await prisma.$transaction([
    prisma.demoUser.update({
      where: { id: user.id },
      data: { balance: balanceAfter },
    }),
    prisma.demoBet.create({
      data: {
        userId: user.id,
        betAmount,
        
        result,
        payout: won ? betAmount : 0,
        status: 'settled',
      },
    }),
  ])

  return c.json({
    result,
    won,
    balanceBefore,
    balanceAfter,
    timestamp: new Date().toISOString(),
  })
})

demo.get('/balance/:walletAddress', async (c) => {
  const walletAddress = c.req.param('walletAddress')

  const user = await prisma.demoUser.findUnique({
    where: { walletAddress },
  })

  if (!user) {
    return c.json({ balance: 0 })
  }

  return c.json({ balance: user.balance })
})

demo.get('/history/:walletAddress', async (c) => {
    const walletAddress = c.req.param('walletAddress')
  
    const user = await prisma.demoUser.findUnique({
      where: { walletAddress },
    })
  
    if (!user) {
      return c.json({ bets: [] })
    }
  
    const bets = await prisma.demoBet.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })
  
    return c.json({ bets })
  })
  

export default demo
