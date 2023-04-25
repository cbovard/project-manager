import prisma from 'lib/prisma'
import { authOptions } from 'pages/api/auth/[...nextauth].js'
import { getServerSession } from 'next-auth/next'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(501).end()
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ message: 'Not logged in' })

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  })

  if (!user) return res.status(401).json({ message: 'User not found' })

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
  await stripe.subscriptions.del(user.stripeSubscriptionId)

  await prisma.user.delete({
    where: {
      id: user.id,
    },
  })

  res.end()
}