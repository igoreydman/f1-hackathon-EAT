import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateQuestionLength } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { text, askToken } = await request.json()

    if (!text || !askToken) {
      return NextResponse.json(
        { error: 'Text and askToken are required' },
        { status: 400 }
      )
    }

    if (!validateQuestionLength(text)) {
      return NextResponse.json(
        { error: 'Question must be between 1 and 140 characters' },
        { status: 400 }
      )
    }

    // Find AMA by ask token
    const ama = await prisma.aMA.findUnique({
      where: { askToken },
    })

    if (!ama) {
      return NextResponse.json(
        { error: 'Invalid ask token' },
        { status: 404 }
      )
    }

    if (!ama.isPublished) {
      return NextResponse.json(
        { error: 'AMA is not published yet' },
        { status: 400 }
      )
    }

    const question = await prisma.question.create({
      data: {
        text: text.trim(),
        amaId: ama.id,
      },
    })

    return NextResponse.json({
      id: question.id,
      text: question.text,
      voteCount: question.voteCount,
      createdAt: question.createdAt,
    })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}