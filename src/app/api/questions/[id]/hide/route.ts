import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const { hostToken, isHidden } = await request.json()

    if (!hostToken) {
      return NextResponse.json(
        { error: 'Host token is required' },
        { status: 400 }
      )
    }

    // Find the question and verify host permissions
    const question = await prisma.question.findUnique({
      where: { id },
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

    if (question.ama.hostToken !== hostToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: { isHidden: Boolean(isHidden) },
    })

    return NextResponse.json({
      id: updatedQuestion.id,
      isHidden: updatedQuestion.isHidden,
    })
  } catch (error) {
    console.error('Error hiding/showing question:', error)
    return NextResponse.json(
      { error: 'Failed to update question visibility' },
      { status: 500 }
    )
  }
}