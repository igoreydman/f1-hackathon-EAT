import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { questionId, core, steps, limits, answerToken } = await request.json()

    if (!questionId || !core || !steps || !limits || !answerToken) {
      return NextResponse.json(
        { error: 'All fields are required: questionId, core, steps, limits, answerToken' },
        { status: 400 }
      )
    }

    // Find the question and verify answer token
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        ama: true,
        answer: true,
      },
    })

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    if (question.ama.answerToken !== answerToken) {
      return NextResponse.json(
        { error: 'Invalid answer token' },
        { status: 403 }
      )
    }

    if (!question.ama.isPublished) {
      return NextResponse.json(
        { error: 'AMA is not published yet' },
        { status: 400 }
      )
    }

    if (question.answer) {
      return NextResponse.json(
        { error: 'Question already has an answer' },
        { status: 400 }
      )
    }

    const answer = await prisma.answer.create({
      data: {
        questionId,
        core: core.trim(),
        steps: steps.trim(),
        limits: limits.trim(),
      },
    })

    return NextResponse.json({
      id: answer.id,
      questionId: answer.questionId,
      core: answer.core,
      steps: answer.steps,
      limits: answer.limits,
      createdAt: answer.createdAt,
    })
  } catch (error) {
    console.error('Error creating answer:', error)
    return NextResponse.json(
      { error: 'Failed to create answer' },
      { status: 500 }
    )
  }
}