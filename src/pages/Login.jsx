import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../css/auth.css';

function Login() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const res = await axios.post(
        'http://localhost:5000/api/auth/login',
        form
      );

             localStorage.setItem(
  'token',
  res.data.token
);

localStorage.setItem(
  'name',
  res.data.user.name
);

localStorage.setItem(
  'email',
  res.data.user.email
);
 

      alert('Login Successful');

      navigate('/dashboard');

    } catch (err) {

      console.log(err);

      alert('Login Failed');

    }

  };

  return (

    <div className="auth-container">

      <form
        className="auth-form"
        onSubmit={handleSubmit}
      >

        <h2>Welcome Back</h2>

        <input
          type="email"
          placeholder="Enter Email"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value
            })
          }
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value
            })
          }
        />

        <button type="submit">
          Login
        </button>

        <p>
          Don't have an account?
          <Link to="/register">
            Register
          </Link>
        </p>

      </form>

    </div>

  );

}

export default Login;