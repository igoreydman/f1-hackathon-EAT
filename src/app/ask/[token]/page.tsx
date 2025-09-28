'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Question {
  id: string
  text: string
  voteCount: number
  createdAt: string
  hasVoted?: boolean
  answer?: {
    id: string
    core: string
    steps: string
    limits: string
  }
}

interface AMA {
  id: string
  title: string
  description?: string
  isPublished: boolean
  questions: Question[]
}

export default function AskPage() {
  const { token } = useParams()
  const [ama, setAMA] = useState<AMA | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [questionText, setQuestionText] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

      if (!data.permissions?.canAsk) {
        throw new Error('Invalid ask token')
      }

      setAMA(data)
    } catch (error) {
      console.error('Error fetching AMA:', error)
      setError('Failed to load AMA or invalid token')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!questionText.trim()) {
      // TODO: Replace with toast notification
      alert('Please enter a question')
      return
    }

    if (questionText.length > 140) {
      // TODO: Replace with toast notification
      alert('Question must be 140 characters or less')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: questionText.trim(),
          askToken: token,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit question')
      }

      // Refresh the AMA data to show the new question
      await fetchAMA()
      setQuestionText('')
      // TODO: Replace with toast notification
      alert('Question submitted successfully!')
    } catch (error) {
      console.error('Error submitting question:', error)
      // TODO: Replace with toast notification
      alert(`Failed to submit question: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleVote = async (questionId: string) => {
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          askToken: token,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to vote')
      }

      const result = await response.json()

      // Update the question in the local state
      setAMA(prev => {
        if (!prev) return null
        return {
          ...prev,
          questions: prev.questions.map(q =>
            q.id === questionId
              ? { ...q, voteCount: result.voteCount, hasVoted: true }
              : q
          ),
        }
      })
    } catch (error) {
      console.error('Error voting:', error)
      // TODO: Replace with toast notification
      alert(`Failed to vote: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-dark flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="spinner h-32 w-32 mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading AMA...</p>
        </div>
      </div>
    )
  }

  if (error || !ama) {
    return (
      <div className="min-h-screen bg-ink-dark flex items-center justify-center p-4">
        <div className="max-w-md w-full card text-center animate-fade-in">
          <div className="w-16 h-16 bg-red-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-text-secondary mb-6">{error || 'This AMA doesn\'t exist or the link is invalid.'}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="btn-primary hover-lift"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  if (!ama.isPublished) {
    return (
      <div className="min-h-screen bg-ink-dark flex items-center justify-center p-4">
        <div className="max-w-md w-full card text-center animate-fade-in">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-yellow-400 mb-4">AMA Not Ready</h1>
          <p className="text-text-secondary mb-4">This AMA hasn't been published yet.</p>
          <p className="text-text-muted text-sm">The host is still setting things up. Please check back later!</p>
        </div>
      </div>
    )
  }

  const characterCount = questionText.length
  const isOverLimit = characterCount > 140

  return (
    <div className="min-h-screen bg-ink-dark p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="card mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-electric-blue/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-text-primary mb-1">{ama.title}</h1>
              <p className="text-text-muted text-sm">Ask your questions and vote on others</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {ama.questions.length} questions
            </div>
          </div>
          {ama.description && (
            <p className="text-text-secondary leading-relaxed mb-4">{ama.description}</p>
          )}

          <form onSubmit={handleSubmitQuestion} className="space-y-6">
            <div>
              <label htmlFor="question" className="block text-lg font-semibold text-text-primary mb-3">
                What would you like to know?
              </label>
              <div className="relative">
                <textarea
                  id="question"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Ask something specific and engaging... What are you curious about?"
                  rows={4}
                  className={`input-field w-full resize-none text-base ${
                    isOverLimit ? 'border-red-500/50 bg-red-500/10' : ''
                  }`}
                  disabled={submitting}
                  maxLength={140}
                  aria-describedby="character-count question-help"
                />
                <div className="absolute bottom-3 right-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    isOverLimit
                      ? 'text-red-400 bg-red-500/20'
                      : characterCount > 120
                        ? 'text-yellow-400 bg-yellow-500/20'
                        : 'text-text-muted bg-glass-medium'
                  }`} id="character-count">
                    {characterCount}/140
                  </span>
                </div>
              </div>
              <p id="question-help" className="text-sm text-text-muted mt-2">
                💡 Great questions are specific, clear, and focused on what you want to learn
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || !questionText.trim() || isOverLimit}
              className="btn-primary w-full py-3 text-lg font-semibold hover-lift hover-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="spinner w-5 h-5"></div>
                  <span>Submitting your question...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Submit Question
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Questions List */}
        <div className="card animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
              <div className="w-8 h-8 bg-gold/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              Community Questions ({ama.questions.length})
            </h2>
            {ama.questions.length > 0 && (
              <div className="text-sm text-text-muted">
                Sorted by votes • {ama.questions.filter(q => q.answer).length} answered
              </div>
            )}
          </div>

          {ama.questions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-glass-medium rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">No Questions Yet</h3>
              <p className="text-text-secondary max-w-md mx-auto">
                Be the first to ask a question! Your curiosity helps shape this discussion.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {ama.questions
                .sort((a, b) => b.voteCount - a.voteCount)
                .map((question, index) => (
                <div key={question.id} className="glass-panel rounded-xl p-6 hover-lift transition-all duration-120">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 bg-electric-blue/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-electric-blue font-bold text-sm">#{index + 1}</span>
                        </div>
                        <p className="text-text-primary text-lg leading-relaxed">{question.text}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        </svg>
                        <span className="bg-gold/20 text-gold px-3 py-1 rounded-full text-sm font-medium">
                          {question.voteCount} votes
                        </span>
                      </div>

                      <button
                        onClick={() => handleVote(question.id)}
                        disabled={question.hasVoted}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-120 hover-lift focus-ring ${
                          question.hasVoted
                            ? 'bg-glass-medium text-text-muted cursor-not-allowed border border-glass-light'
                            : 'bg-electric-blue/20 text-electric-blue border border-electric-blue/20 hover:bg-electric-blue/30 hover-glow'
                        }`}
                        aria-label={question.hasVoted ? 'Already voted' : 'Vote for this question'}
                      >
                        {question.hasVoted ? (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Voted
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                            Vote
                          </div>
                        )}
                      </button>
                    </div>
                  </div>

                  {question.answer && (
                    <div className="mt-4 glass-panel rounded-lg p-4 border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Expert Answer:
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="bg-glass-medium rounded-lg p-3">
                          <span className="font-semibold text-electric-blue text-xs uppercase tracking-wide">Core Concept:</span>
                          <p className="text-text-secondary mt-1">{question.answer.core}</p>
                        </div>
                        <div className="bg-glass-medium rounded-lg p-3">
                          <span className="font-semibold text-gold text-xs uppercase tracking-wide">Step-by-Step:</span>
                          <p className="text-text-secondary mt-1">{question.answer.steps}</p>
                        </div>
                        <div className="bg-glass-medium rounded-lg p-3">
                          <span className="font-semibold text-red-400 text-xs uppercase tracking-wide">Limitations:</span>
                          <p className="text-text-secondary mt-1">{question.answer.limits}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-glass-light">
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Asked {new Date(question.createdAt).toLocaleDateString()}
                    </span>
                    {question.answer && (
                      <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                        Answered
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}