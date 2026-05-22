import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Home.css'

export default function Home() {
  const { user } = useAuth()

  return (
    <main className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-lines" aria-hidden="true">
          {[...Array(8)].map((_, i) => <div key={i} className="bg-line" />)}
        </div>
        <div className="hero-content">
          <div className="hero-eyebrow fade-up">
            <span className="eyebrow-dot" />
            Where words find their weight
          </div>
          <h1 className="hero-title fade-up" style={{ animationDelay: '0.1s' }}>
            The art of<br />
            <em>writing lives</em><br />
            here.
          </h1>
          <p className="hero-sub fade-up" style={{ animationDelay: '0.2s' }}>
            A refined space for thoughtful writers. Share your stories,
            craft your perspective, and let your voice leave its mark.
          </p>
          <div className="hero-cta fade-up" style={{ animationDelay: '0.3s' }}>
            {user ? (
              <Link to="/create" className="cta-primary">Start Writing</Link>
            ) : (
              <>
                <Link to="/signup" className="cta-primary">Begin Your Journey</Link>
                <Link to="/login" className="cta-secondary">Sign In</Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-deco fade-in" style={{ animationDelay: '0.4s' }} aria-hidden="true">
          <div className="deco-circle" />
          <div className="deco-ring" />
          <span className="deco-text">EST. 2024</span>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="features-inner">
          <div className="section-label">What we offer</div>
          <div className="features-grid">
            {[
              {
                icon: '✦',
                title: 'Write Freely',
                desc: 'A distraction-free canvas for your ideas. Focus on what matters — your words.'
              },
              {
                icon: '◈',
                title: 'Publish with Image',
                desc: 'Every story deserves a visual. Upload your imagery, stored securely on Cloudinary.'
              },
              {
                icon: '◉',
                title: 'Own Your Voice',
                desc: 'Full control over your content. Edit your profile, manage your stories, delete anytime.'
              },
              {
                icon: '⬡',
                title: 'Role-Based Access',
                desc: 'Admin tools for moderation. User tools for creation. Everything in its right place.'
              },
            ].map((f, i) => (
              <div className="feature-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="feature-icon">{f.icon}</span>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="cta-banner-inner">
          <h2 className="cta-banner-title">
            Your story is<br /><em>worth telling.</em>
          </h2>
          <Link to={user ? '/create' : '/signup'} className="cta-primary large">
            {user ? 'Create a Blog Post' : 'Join Inkwell'}
          </Link>
        </div>
      </section>

      <footer className="home-footer">
        <span className="brand-icon-footer">✦</span>
        <span>Inkwell © {new Date().getFullYear()}</span>
      </footer>
    </main>
  )
}
