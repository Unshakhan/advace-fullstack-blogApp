import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { verifyEmail } from '../api'
import './Auth.css'

export default function VerifyEmail() {
  const { token } = useParams()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link.')
      return
    }

    verifyEmail(token)
      .then(({ data }) => {
        if (data.status) {
          setStatus('success')
          setMessage(data.message)
          toast.success('Email verified!')
        } else {
          setStatus('error')
          setMessage(data.message || 'Verification failed')
        }
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err?.response?.data?.message || 'Verification failed')
      })
  }, [token])

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-eyebrow">
          <span />
          Email verification
        </div>
        <h1 className="auth-title">
          {status === 'loading' && 'Verifying…'}
          {status === 'success' && <>Verified</>}
          {status === 'error' && <>Failed</>}
        </h1>
        <p className="auth-sub">
          {status === 'loading' ? 'Please wait while we verify your email.' : message}
        </p>
        {status !== 'loading' && (
          <div className="auth-footer">
            <Link to="/login">Go to Sign In</Link>
          </div>
        )}
      </div>
    </div>
  )
}
