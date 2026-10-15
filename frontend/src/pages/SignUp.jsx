import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../axiosCalls/axios'

// User registration page handling account creation and field submission
function SignUp() {
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '' })
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
      await axiosInstance.post('/users/register', form)
      navigate('/login')
    } catch (error) {
      console.log(error)
      if (!error.response) {
        setErr('Cannot connect to backend server. Please ensure the backend is running at http://localhost:8082.')
      } else {
        setErr(error.response?.data?.message || 'Registration failed. Please try again.')
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
          <h2 className="auth-title">Create your account</h2>
          <p className="auth-subtitle">Sign up to start shopping on ShopKart.</p>
        </div>

        {err && <p className="auth-error">{err}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="name" className="field-label">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="name"
              value={form.name}
              onChange={handleChange}
              className="auth-input"
            />
          </div>

          <div className="field-group">
            <label htmlFor="username" className="field-label">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="username"
              value={form.username}
              onChange={handleChange}
              className="auth-input"
            />
          </div>

          <div className="field-group">
            <label htmlFor="email" className="field-label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="email"
              value={form.email}
              onChange={handleChange}
              className="auth-input"
            />
          </div>

          <div className="field-group">
            <label htmlFor="password" className="field-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              onChange={handleChange}
              value={form.password}
              placeholder="••••••••"
              className="auth-input"
            />
          </div>

          <button type="submit" disabled={loader} className="auth-btn">
            {loader ? 'Signing up...' : 'Sign up'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignUp