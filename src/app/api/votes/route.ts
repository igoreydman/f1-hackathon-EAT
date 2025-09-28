import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClientIP, parseVoterIPs, stringifyVoterIPs } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { questionId, askToken } = await request.json()

    if (!questionId || !askToken) {
      return NextResponse.json(
        { error: 'Question ID and ask token are required' },
        { status: 400 }
      )
    }

    // Get client IP
    const clientIP = getClientIP(request)

    // Find the question and verify ask token
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        ama: true,
      },
    })

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    if (question.ama.askToken !== askToken) {
      return NextResponse.json(
        { error: 'Invalid ask token' },
        { status: 403 }
      )
    }

    if (!question.ama.isPublished) {
      return NextResponse.json(
        { error: 'AMA is not published yet' },
        { status: 400 }
      )
    }

    // Check if IP has already voted
    const voterIPs = parseVoterIPs(question.voterIPs)
    if (voterIPs.includes(clientIP)) {
      return NextResponse.json(
        { error: 'You have already voted on this question' },
        { status: 400 }
      )
    }

    // Add IP to voter list and increment vote count
    const updatedVoterIPs = [...voterIPs, clientIP]
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        voterIPs: stringifyVoterIPs(updatedVoterIPs),
        voteCount: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({
      id: updatedQuestion.id,
      voteCount: updatedQuestion.voteCount,
      hasVoted: true,
    })
  } catch (error) {
    console.error('Error voting on question:', error)
    return NextResponse.json(
      { error: 'Failed to vote on question' },
      { status: 500 }
    )
  }
}