'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Question {
  id: string
  text: string
  voteCount: number
  isHidden: boolean
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
  createdAt: string
  questions: Question[]
  tokens?: {
    askToken: string
    answerToken: string
    digestToken: string
  }
}

export default function HostPage() {
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
      setAMA(data)
    } catch (error) {
      console.error('Error fetching AMA:', error)
      setError('Failed to load AMA')
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!ama) return

    try {
      const response = await fetch(`/api/ama/${token}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'publish' }),
      })

      if (!response.ok) {
        throw new Error('Failed to publish AMA')
      }

      setAMA(prev => prev ? { ...prev, isPublished: true } : null)
    } catch (error) {
      console.error('Error publishing AMA:', error)
      // TODO: Replace with toast notification
      alert('Failed to publish AMA')
    }
  }

  const handleHideQuestion = async (questionId: string, isHidden: boolean) => {
    try {
      const response = await fetch(`/api/questions/${questionId}/hide`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hostToken: token, isHidden }),
      })

      if (!response.ok) {
        throw new Error('Failed to update question visibility')
      }

      setAMA(prev => {
        if (!prev) return null
        return {
          ...prev,
          questions: prev.questions.map(q =>
            q.id === questionId ? { ...q, isHidden } : q
          ),
        }
      })
    } catch (error) {
      console.error('Error updating question visibility:', error)
      // TODO: Replace with toast notification
      alert('Failed to update question visibility')
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    // TODO: Replace with toast notification
    alert(`${label} copied to clipboard!`)
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
          <h1 className="text-2xl font-bold text-red-400 mb-4">AMA Not Found</h1>
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

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const askUrl = ama.tokens ? `${baseUrl}/ask/${ama.tokens.askToken}` : ''
  const answerUrl = ama.tokens ? `${baseUrl}/answer/${ama.tokens.answerToken}` : ''
  const digestUrl = ama.tokens ? `${baseUrl}/digest/${ama.tokens.digestToken}` : ''

  return (
    <div className="min-h-screen bg-ink-dark p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Card */}
        <div className="card mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-electric-blue/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-text-primary mb-1">{ama.title}</h1>
                  <p className="text-text-muted text-sm">Host Dashboard</p>
                </div>
              </div>
              {ama.description && (
                <p className="text-text-secondary mb-4 leading-relaxed">{ama.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4">
                <span className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                  ama.isPublished
                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      ama.isPublished ? 'bg-green-400' : 'bg-yellow-400'
                    } animate-pulse`}></div>
                    {ama.isPublished ? 'Live & Published' : 'Draft Mode'}
                  </div>
                </span>
                <span className="text-sm text-text-muted flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Created {new Date(ama.createdAt).toLocaleDateString()}
                </span>
                <span className="text-sm text-text-muted flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {ama.questions.length} questions
                </span>
              </div>
            </div>
            {!ama.isPublished && (
              <button
                onClick={handlePublish}
                className="btn-gold hover-lift hover-glow px-6 py-3 text-lg font-semibold"
              >
                🚀 Publish AMA
              </button>
            )}
          </div>

          {ama.isPublished && (
            <div className="border-t border-glass-light pt-6">
              <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share Your AMA
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="glass-panel p-4 rounded-xl hover-lift">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-primary text-sm">Ask Questions</h4>
                      <p className="text-text-muted text-xs">For your audience</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={askUrl}
                      readOnly
                      className="flex-1 text-sm input-field text-xs font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(askUrl, 'Ask URL')}
                      className="btn-secondary text-xs px-3 py-1 hover-glow"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="glass-panel p-4 rounded-xl hover-lift">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-primary text-sm">Answer Questions</h4>
                      <p className="text-text-muted text-xs">For experts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={answerUrl}
                      readOnly
                      className="flex-1 text-sm input-field text-xs font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(answerUrl, 'Answer URL')}
                      className="btn-secondary text-xs px-3 py-1 hover-glow"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="glass-panel p-4 rounded-xl hover-lift">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gold/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-primary text-sm">View Digest</h4>
                      <p className="text-text-muted text-xs">Full Q&A summary</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={digestUrl}
                      readOnly
                      className="flex-1 text-sm input-field text-xs font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(digestUrl, 'Digest URL')}
                      className="btn-secondary text-xs px-3 py-1 hover-glow"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Questions Section */}
        <div className="card animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
              <div className="w-8 h-8 bg-electric-blue/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Questions ({ama.questions.length})
            </h2>
            {ama.questions.length > 0 && (
              <div className="text-sm text-text-muted">
                {ama.questions.filter(q => q.answer).length} answered • {ama.questions.filter(q => !q.isHidden).length} visible
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
              <p className="text-text-secondary mb-4 max-w-md mx-auto">
                {ama.isPublished
                  ? 'Share the ask link with your audience to start receiving questions!'
                  : 'Publish your AMA first, then share the ask link to start collecting questions.'}
              </p>
              {ama.isPublished && (
                <button
                  onClick={() => copyToClipboard(askUrl, 'Ask URL')}
                  className="btn-primary hover-lift"
                >
                  Copy Ask Link
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {ama.questions
                .sort((a, b) => b.voteCount - a.voteCount)
                .map((question, index) => (
                <div
                  key={question.id}
                  className={`glass-panel rounded-xl p-6 transition-all duration-120 hover-lift ${
                    question.isHidden ? 'border-red-500/20 bg-red-500/5' : ''
                  }`}
                >
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
                        onClick={() => handleHideQuestion(question.id, !question.isHidden)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-120 hover-lift ${
                          question.isHidden
                            ? 'bg-green-500/20 text-green-400 border border-green-500/20 hover:bg-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500/30'
                        }`}
                      >
                        {question.isHidden ? 'Show' : 'Hide'}
                      </button>
                    </div>
                  </div>

                  {question.answer && (
                    <div className="mt-4 glass-panel rounded-lg p-4 border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Answer:
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