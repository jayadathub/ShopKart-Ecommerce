import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../axiosCalls/axios'

// User authentication login page managing credentials input and session initiation
function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [err, setErr] = useState('')
  const [loader, setLoader] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    setLoader(true)

    try {
      await axiosInstance.post('/users/login', form)
      navigate('/home')
    } catch (error) {
      console.log(error)
      if (!error.response) {
        setErr('Cannot connect to backend server. Please ensure the backend is running at http://localhost:8082.')
      } else {
        setErr(error.response?.data?.message || 'Login failed. Please try again.')
      }
    } finally {
      setLoader(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand-wrap">
          <div className="brand-mark">🛒</div>
          <h1 className="brand-name">ShopKart</h1>
          <p className="page-subtitle">Discover quality products at great prices.</p>
        </div>

        <div>
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Log in to continue shopping on ShopKart.</p>
        </div>

        {err && <p className="auth-error">{err}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="email" className="field-label">Email or Username</label>
            <input
              id="email"
              name="email"
              type="text"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com or username"
              className="auth-input"
            />
          </div>

          <div className="field-group">
            <label htmlFor="password" className="field-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="auth-input"
            />
          </div>

          <button type="submit" disabled={loader} className="auth-btn">
            {loader ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="auth-footer">
          Don’t have an account?{' '}
          <Link to="/signup" className="auth-link">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login