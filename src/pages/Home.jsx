import { Link } from 'react-router-dom';
import '../css/home.css';

function Home() {
  return (
    <div className="home">

      {/* NAVBAR */}
      <nav>
        <div className="logo">SmartCloud</div>

        <div className="nav-links">
          <Link to="/login">Sign In</Link>
          <Link to="/register">Create Account</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="hero">

        <h1>SmartCloud Storage</h1>

        <p>
          Secure, fast, and scalable 
          cloud storage solution. Store your files in smart buckets, manage uploads, and access your data
           anytime, anywhere. Protect your digital assets with advanced end-to-end encryption and a resilient 
           zero-trust framework. Experience lightning-fast global access through optimized edge networks, 
           paired with intelligent data management that cuts infrastructure costs automatically.
        </p>

        <div className="hero-buttons">
          <Link to="/login">Get Started</Link>
          <Link to="/register">Create Free Account</Link>
        </div>

      </div>

      {/* FEATURES SECTION */}
      <div className="features">

        <div className="feature-card">
          <h3>☁ Secure Storage</h3>
          <p>Your files are encrypted and safely stored in cloud buckets.</p>
        </div>

        <div className="feature-card">
          <h3>⚡ Fast Access</h3>
          <p>Instant upload and download with optimized backend APIs.</p>
        </div>

        <div className="feature-card">
          <h3>📦 Smart Buckets</h3>
          <p>Organize files into dynamic buckets for better management.</p>
        </div>

      </div>

    </div>
  );
}

export default Home;