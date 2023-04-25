// Dynamic Routes: https://nextjs.org/docs/routing/dynamic-routes

import prisma from 'lib/prisma'
import { authOptions } from 'pages/api/auth/[...nextauth].js'
import { getServerSession } from 'next-auth/next'

export default async function handler(req, res) {

  if (req.method !== 'DELETE') {
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

  // Get the Project ID to delete but need to convert to integer.
  const pid = parseInt(req.query.pid)

  if (req.method === 'DELETE') {
    await prisma.project.deleteMany({
      where: {
        id: pid,
				owner: {
          id: user.id,
        },
      },
    })
  }

  res.end()
}