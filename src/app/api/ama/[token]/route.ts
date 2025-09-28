import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    token: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = params

    // Find AMA by any of the tokens
    const ama = await prisma.aMA.findFirst({
      where: {
        OR: [
          { hostToken: token },
          { askToken: token },
          { answerToken: token },
          { digestToken: token },
        ],
      },
      include: {
        questions: {
          include: {
            answer: true,
          },
          orderBy: {
            voteCount: 'desc',
          },
        },
      },
    })

    if (!ama) {
      return NextResponse.json(
        { error: 'AMA not found' },
        { status: 404 }
      )
    }

    // Determine user permissions based on token type
    const isHost = ama.hostToken === token
    const canAsk = ama.askToken === token
    const canAnswer = ama.answerToken === token
    const isDigest = ama.digestToken === token

    // Filter questions based on permissions
    let questions = ama.questions
    if (!isHost && !canAnswer) {
      // For ask and digest views, hide hidden questions
      questions = questions.filter(q => !q.isHidden)
    }

    const responseData: any = {
      id: ama.id,
      title: ama.title,
      description: ama.description,
      isPublished: ama.isPublished,
      createdAt: ama.createdAt,
      questions,
      permissions: {
        isHost,
        canAsk,
        canAnswer,
        isDigest,
      },
    }

    // Include tokens if user is host
    if (isHost) {
      responseData.tokens = {
        askToken: ama.askToken,
        answerToken: ama.answerToken,
        digestToken: ama.digestToken,
      }
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching AMA:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AMA' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = params
    const { action, title, description } = await request.json()

    // Find AMA by host token only (only host can modify)
    const ama = await prisma.aMA.findUnique({
      where: { hostToken: token },
    })

    if (!ama) {
      return NextResponse.json(
        { error: 'AMA not found or unauthorized' },
        { status: 404 }
      )
    }

    if (action === 'publish') {
      const updatedAMA = await prisma.aMA.update({
        where: { id: ama.id },
        data: { isPublished: true },
      })

      return NextResponse.json({
        id: updatedAMA.id,
        isPublished: updatedAMA.isPublished,
      })
    }

    if (action === 'update' && !ama.isPublished) {
      // Only allow updates before publishing
      const updatedAMA = await prisma.aMA.update({
        where: { id: ama.id },
        data: {
          title: title?.trim() || ama.title,
          description: description?.trim() || ama.description,
        },
      })

      return NextResponse.json({
        id: updatedAMA.id,
        title: updatedAMA.title,
        description: updatedAMA.description,
      })
    }

    return NextResponse.json(
      { error: 'Invalid action or AMA already published' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating AMA:', error)
    return NextResponse.json(
      { error: 'Failed to update AMA' },
      { status: 500 }
    )
  }
}