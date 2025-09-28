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
  }
}

interface AMA {
  id: string
  title: string
  description?: string
  isPublished: boolean
  questions: Question[]
}

export default function AnswerPage() {
  const { token } = useParams()
  const [ama, setAMA] = useState<AMA | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState({
    core: '',
    steps: '',
    limits: '',
  })
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

      if (!data.permissions?.canAnswer) {
        throw new Error('Invalid answer token')
      }

      setAMA(data)
    } catch (error) {
      console.error('Error fetching AMA:', error)
      setError('Failed to load AMA or invalid token')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectQuestion = (question: Question) => {
    if (question.answer) {
      // If question already has an answer, populate the form for viewing
      setAnswer({
        core: question.answer.core,
        steps: question.answer.steps,
        limits: question.answer.limits,
      })
    } else {
      // Clear form for new answer
      setAnswer({
        core: '',
        steps: '',
        limits: '',
      })
    }
    setSelectedQuestion(question)
  }

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedQuestion) {
      // TODO: Replace with toast notification
      alert('Please select a question to answer')
      return
    }

    if (!answer.core.trim() || !answer.steps.trim() || !answer.limits.trim()) {
      // TODO: Replace with toast notification
      alert('Please fill in all three fields: Core, Steps, and Limits')
      return
    }

    if (selectedQuestion.answer) {
      // TODO: Replace with toast notification
      alert('This question already has an answer')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: selectedQuestion.id,
          core: answer.core.trim(),
          steps: answer.steps.trim(),
          limits: answer.limits.trim(),
          answerToken: token,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit answer')
      }

      // Refresh the AMA data to show the new answer
      await fetchAMA()
      setAnswer({ core: '', steps: '', limits: '' })
      setSelectedQuestion(null)
      // TODO: Replace with toast notification
      alert('Answer submitted successfully!')
    } catch (error) {
      console.error('Error submitting answer:', error)
      // TODO: Replace with toast notification
      alert(`Failed to submit answer: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSubmitting(false)
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

  const unansweredQuestions = ama.questions.filter(q => !q.answer)
  const answeredQuestions = ama.questions.filter(q => q.answer)

  return (
    <div className="min-h-screen bg-ink-dark p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="card mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-text-primary mb-1">{ama.title}</h1>
              <p className="text-text-muted text-sm">Expert answering interface</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {ama.questions.length} total
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {answeredQuestions.length} answered
              </div>
            </div>
          </div>
          {ama.description && (
            <p className="text-text-secondary leading-relaxed mb-4">{ama.description}</p>
          )}
          <div className="glass-panel rounded-lg p-4 border-l-4 border-electric-blue">
            <h3 className="font-semibold text-electric-blue mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Answer Format
            </h3>
            <p className="text-text-secondary text-sm">
              Each answer should have three parts: <strong className="text-electric-blue">Core</strong> (main point),
              <strong className="text-gold"> Steps</strong> (process/how-to), and <strong className="text-red-400">Limits</strong> (limitations/considerations).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Questions List */}
          <div className="card animate-slide-up">
            <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-electric-blue/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Questions to Answer ({unansweredQuestions.length})
            </h2>

            {unansweredQuestions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">All Caught Up!</h3>
                <p className="text-text-secondary">All questions have been answered. Great work!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {unansweredQuestions
                  .sort((a, b) => b.voteCount - a.voteCount)
                  .map((question, index) => (
                  <div
                    key={question.id}
                    className={`glass-panel rounded-lg p-5 cursor-pointer transition-all duration-120 hover-lift focus-ring ${
                      selectedQuestion?.id === question.id
                        ? 'border-electric-blue/50 bg-electric-blue/10'
                        : 'hover:bg-glass-light'
                    }`}
                    onClick={() => handleSelectQuestion(question)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleSelectQuestion(question)
                      }
                    }}
                    aria-label={`Select question: ${question.text}`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-6 h-6 bg-electric-blue/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-electric-blue font-bold text-xs">#{index + 1}</span>
                      </div>
                      <p className="text-text-primary leading-relaxed flex-1">{question.text}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-text-muted flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(question.createdAt).toLocaleDateString()}
                      </span>
                      <span className="bg-gold/20 text-gold px-3 py-1 rounded-full font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        </svg>
                        {question.voteCount} votes
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {answeredQuestions.length > 0 && (
              <>
                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
                  Answered Questions ({answeredQuestions.length})
                </h3>
                <div className="space-y-3">
                  {answeredQuestions
                    .sort((a, b) => b.voteCount - a.voteCount)
                    .map(question => (
                    <div
                      key={question.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedQuestion?.id === question.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-green-200 hover:border-green-300 hover:bg-green-50'
                      }`}
                      onClick={() => handleSelectQuestion(question)}
                    >
                      <p className="text-gray-900 mb-2">{question.text}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-green-600 font-medium">✓ Answered</span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                          {question.voteCount} votes
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Answer Form */}
          <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              {selectedQuestion ?
                (selectedQuestion.answer ? 'View Answer' : 'Provide Answer') :
                'Select a Question'}
            </h2>

            {selectedQuestion ? (
              <>
                <div className="glass-panel rounded-lg p-5 mb-6 border-l-4 border-electric-blue">
                  <h3 className="font-semibold text-electric-blue mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Selected Question:
                  </h3>
                  <p className="text-text-primary text-lg leading-relaxed mb-3">{selectedQuestion.text}</p>
                  <div className="flex items-center gap-4 text-sm text-text-muted">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                      {selectedQuestion.voteCount} votes
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(selectedQuestion.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmitAnswer} className="space-y-6">
                  <div>
                    <label htmlFor="core" className="block text-lg font-semibold text-electric-blue mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Core Concept *
                    </label>
                    <textarea
                      id="core"
                      value={answer.core}
                      onChange={(e) => setAnswer(prev => ({ ...prev, core: e.target.value }))}
                      placeholder="What is the main point or core concept? Explain the fundamental idea..."
                      rows={4}
                      className="input-field w-full resize-none"
                      disabled={submitting || !!selectedQuestion.answer}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="steps" className="block text-lg font-semibold text-gold mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Steps & Process *
                    </label>
                    <textarea
                      id="steps"
                      value={answer.steps}
                      onChange={(e) => setAnswer(prev => ({ ...prev, steps: e.target.value }))}
                      placeholder="Break it down step-by-step. How would someone actually do this?"
                      rows={4}
                      className="input-field w-full resize-none"
                      disabled={submitting || !!selectedQuestion.answer}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="limits" className="block text-lg font-semibold text-red-400 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Limitations & Considerations *
                    </label>
                    <textarea
                      id="limits"
                      value={answer.limits}
                      onChange={(e) => setAnswer(prev => ({ ...prev, limits: e.target.value }))}
                      placeholder="What are the limitations, edge cases, or important considerations?"
                      rows={4}
                      className="input-field w-full resize-none"
                      disabled={submitting || !!selectedQuestion.answer}
                      required
                    />
                  </div>

                  {!selectedQuestion.answer && (
                    <button
                      type="submit"
                      disabled={submitting || !answer.core.trim() || !answer.steps.trim() || !answer.limits.trim()}
                      className="btn-primary w-full py-3 text-lg font-semibold hover-lift hover-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {submitting ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="spinner w-5 h-5"></div>
                          <span>Submitting answer...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Submit Expert Answer
                        </div>
                      )}
                    </button>
                  )}

                  {selectedQuestion.answer && (
                    <div className="glass-panel rounded-lg p-4 border-l-4 border-green-500">
                      <p className="text-green-400 font-medium flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        This question has already been answered. The form shows the current answer for reference.
                      </p>
                    </div>
                  )}
                </form>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-glass-medium rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Ready to Answer</h3>
                <p className="text-text-secondary max-w-md mx-auto">
                  Select a question from the list to provide your expert answer. Each answer helps the community learn something new.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}