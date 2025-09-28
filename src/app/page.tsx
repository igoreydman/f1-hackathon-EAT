'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCreateAMA = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      // TODO: Replace with toast notification
      alert('Please enter a title for your AMA')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/ama', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create AMA')
      }

      const ama = await response.json()

      // Redirect to host interface with the host token
      router.push(`/host/${ama.hostToken}`)
    } catch (error) {
      console.error('Error creating AMA:', error)
      // TODO: Replace with toast notification
      alert('Failed to create AMA. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-dark relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-electric-blue/10 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-glass-medium backdrop-blur-md border border-glass-light rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-text-secondary text-sm font-medium">Live Expert Q&A Platform</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-text-primary via-gold to-electric-blue bg-clip-text text-transparent">
              Explain-a-thon
            </h1>
            <p className="text-xl md:text-2xl text-text-secondary mb-4 max-w-3xl mx-auto text-balance">
              Where experts break down complex topics through interactive Q&A sessions
            </p>
            <p className="text-text-muted max-w-2xl mx-auto text-balance">
              Create structured AMA sessions, engage with curious minds, and share knowledge that matters.
              Every question gets the attention it deserves.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Create AMA Form */}
            <div className="card animate-slide-up">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-text-primary mb-2">Start Your AMA</h2>
                <p className="text-text-secondary">Share your expertise with the world</p>
              </div>

              <form onSubmit={handleCreateAMA} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-2">
                    What would you like to explain? *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., How modern AI actually works, The art of sourdough baking..."
                    className="input-field w-full"
                    required
                    disabled={loading}
                    maxLength={100}
                    aria-describedby="title-help"
                  />
                  <p id="title-help" className="text-xs text-text-muted mt-1">
                    Keep it clear and engaging ({title.length}/100 characters)
                  </p>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
                    Context (optional)
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Give your audience some background about the topic, your experience, or what they can expect to learn..."
                    rows={4}
                    className="input-field w-full resize-none"
                    disabled={loading}
                    maxLength={500}
                    aria-describedby="description-help"
                  />
                  <p id="description-help" className="text-xs text-text-muted mt-1">
                    Help people understand what they'll learn ({description.length}/500 characters)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !title.trim()}
                  className="btn-primary w-full py-3 text-lg font-semibold hover-lift hover-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  aria-describedby="create-help"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="spinner w-5 h-5"></div>
                      <span>Creating your AMA...</span>
                    </div>
                  ) : (
                    'Create AMA Session'
                  )}
                </button>
                <p id="create-help" className="text-xs text-text-muted text-center">
                  You'll get management links to share with your audience
                </p>
              </form>
            </div>

            {/* How it Works */}
            <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="card">
                <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-electric-blue rounded-lg flex items-center justify-center text-white font-bold text-sm">1</div>
                  Create & Share
                </h3>
                <p className="text-text-secondary">
                  Set up your AMA topic and get unique links for your audience to ask questions and for experts to provide answers.
                </p>
              </div>

              <div className="card">
                <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center text-ink-dark font-bold text-sm">2</div>
                  Engage & Vote
                </h3>
                <p className="text-text-secondary">
                  Your audience asks questions and votes on what they want answered most. Popular questions rise to the top.
                </p>
              </div>

              <div className="card">
                <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">3</div>
                  Structured Answers
                </h3>
                <p className="text-text-secondary">
                  Provide comprehensive answers with core concepts, step-by-step explanations, and important limitations.
                </p>
              </div>

              <div className="glass-panel rounded-xl p-4 border-l-4 border-electric-blue">
                <p className="text-text-secondary text-sm">
                  <span className="font-semibold text-electric-blue">Pro tip:</span> The best AMAs focus on specific, actionable topics where you can provide real value to your audience.
                </p>
              </div>
            </div>
          </div>

          {/* Features showcase */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold text-text-primary mb-8">Why Experts Choose Explain-a-thon</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card hover-lift">
                <div className="w-12 h-12 bg-electric-blue/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text-primary mb-2">Instant Setup</h3>
                <p className="text-text-secondary text-sm">Get your AMA live in seconds. No accounts, no complex setup.</p>
              </div>

              <div className="card hover-lift">
                <div className="w-12 h-12 bg-gold/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text-primary mb-2">Quality Focus</h3>
                <p className="text-text-secondary text-sm">Structured format ensures thoughtful questions and comprehensive answers.</p>
              </div>

              <div className="card hover-lift">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text-primary mb-2">Community Driven</h3>
                <p className="text-text-secondary text-sm">Let your audience guide the discussion through voting and engagement.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
