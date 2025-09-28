'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Question {
  id: string
  text: string
  voteCount: number
  createdAt: string
  answer?: {
    id: string
    core: string
    steps: string
    limits: string
    createdAt: string
  }
}

interface AMA {
  id: string
  title: string
  description?: string
  isPublished: boolean
  createdAt: string
  questions: Question[]
}

export default function DigestPage() {
  const { token } = useParams()
  const [ama, setAMA] = useState<AMA | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (token) {
      fetchAMA()
    }
  }, [token])

  const fetchAMA = async () => {
    try {
      const response = await fetch(`/api/ama/${token}`)
      if (!response.ok) {
        throw new Error('AMA not found')
      }
      const data = await response.json()

      if (!data.permissions?.isDigest) {
        throw new Error('Invalid digest token')
      }

      setAMA(data)
    } catch (error) {
      console.error('Error fetching AMA:', error)
      setError('Failed to load AMA or invalid token')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading AMA digest...</p>
        </div>
      </div>
    )
  }

  if (error || !ama) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error || 'AMA not found'}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  if (!ama.isPublished) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-2xl font-bold text-yellow-600 mb-4">AMA Not Published</h1>
          <p className="text-gray-600">This AMA hasn't been published yet. Please check back later.</p>
        </div>
      </div>
    )
  }

  const answeredQuestions = ama.questions
    .filter(q => q.answer)
    .sort((a, b) => b.voteCount - a.voteCount)

  const unansweredQuestions = ama.questions
    .filter(q => !q.answer)
    .sort((a, b) => b.voteCount - a.voteCount)

  const totalQuestions = ama.questions.length
  const totalVotes = ama.questions.reduce((sum, q) => sum + q.voteCount, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{ama.title}</h1>
            {ama.description && (
              <p className="text-lg text-gray-600 mb-4">{ama.description}</p>
            )}
            <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              AMA Digest - Read Only
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{totalQuestions}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-900">{answeredQuestions.length}</div>
              <div className="text-sm text-green-600">Answered</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-900">{unansweredQuestions.length}</div>
              <div className="text-sm text-yellow-600">Unanswered</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-900">{totalVotes}</div>
              <div className="text-sm text-blue-600">Total Votes</div>
            </div>
          </div>

          <div className="text-center mt-4 text-sm text-gray-500">
            Created on {new Date(ama.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Answered Questions */}
        {answeredQuestions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Answered Questions ({answeredQuestions.length})
            </h2>

            <div className="space-y-6">
              {answeredQuestions.map((question, index) => (
                <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                          #{index + 1}
                        </span>
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm font-medium">
                          {question.voteCount} votes
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {question.text}
                      </h3>
                      <div className="text-sm text-gray-500">
                        Asked on {new Date(question.createdAt).toLocaleDateString()}
                        {question.answer && (
                          <> • Answered on {new Date(question.answer.createdAt).toLocaleDateString()}</>
                        )}
                      </div>
                    </div>
                  </div>

                  {question.answer && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-3">Answer:</h4>
                      <div className="space-y-3">
                        <div className="bg-white rounded-md p-3">
                          <h5 className="font-medium text-green-800 mb-1">Core:</h5>
                          <p className="text-gray-700">{question.answer.core}</p>
                        </div>
                        <div className="bg-white rounded-md p-3">
                          <h5 className="font-medium text-green-800 mb-1">Steps:</h5>
                          <p className="text-gray-700">{question.answer.steps}</p>
                        </div>
                        <div className="bg-white rounded-md p-3">
                          <h5 className="font-medium text-green-800 mb-1">Limits:</h5>
                          <p className="text-gray-700">{question.answer.limits}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unanswered Questions */}
        {unansweredQuestions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Unanswered Questions ({unansweredQuestions.length})
            </h2>

            <div className="space-y-4">
              {unansweredQuestions.map((question, index) => (
                <div key={question.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">
                        #{answeredQuestions.length + index + 1}
                      </span>
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm font-medium">
                        {question.voteCount} votes
                      </span>
                    </div>
                    <span className="text-yellow-600 text-sm font-medium">Pending Answer</span>
                  </div>
                  <p className="text-gray-900 mb-2">{question.text}</p>
                  <div className="text-sm text-gray-500">
                    Asked on {new Date(question.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {totalQuestions === 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-6xl text-gray-300 mb-4">❓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Questions Yet</h2>
            <p className="text-gray-600">This AMA hasn't received any questions yet.</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>This is a read-only digest of the AMA session.</p>
        </div>
      </div>
    </div>
  )
}