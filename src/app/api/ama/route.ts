import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateAMATokens } from '@/lib/tokens'

export async function POST(request: NextRequest) {
  try {
    const { title, description } = await request.json()

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const tokens = generateAMATokens()

    const ama = await prisma.aMA.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        ...tokens,
      },
    })

    return NextResponse.json({
      id: ama.id,
      title: ama.title,
      description: ama.description,
      hostToken: ama.hostToken,
      askToken: ama.askToken,
      answerToken: ama.answerToken,
      digestToken: ama.digestToken,
      isPublished: ama.isPublished,
      createdAt: ama.createdAt,
    })
  } catch (error) {
    console.error('Error creating AMA:', error)
    return NextResponse.json(
      { error: 'Failed to create AMA' },
      { status: 500 }
    )
  }
}