import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

const Welcome = () => {
  const navigate = useNavigate();
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Create particles
    const particleArray = [];
    for (let i = 0; i < 50; i++) {
      particleArray.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 15,
        duration: Math.random() * 10 + 10
      });
    }
    setParticles(particleArray);
  }, []);

  const handleExplore = () => {
    navigate('/');
  };

  return (
    <div className="welcome-screen">
      <div className="particles">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.left}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`
            }}
          />
        ))}
      </div>
      <div className="decorative-circle circle-1"></div>
      <div className="decorative-circle circle-2"></div>
      
      <div className="welcome-content">
        <div className="welcome-logo">HomePlus</div>
        <div className="welcome-tagline">TRANSFORM YOUR DREAM HOME</div>
        <button className="explore-btn" onClick={handleExplore}>
          <span>EXPLORE WEBSITE</span>
        </button>
        <div className="loading-text">Crafted for Indian Middle-Class Homes</div>
      </div>
    </div>
  );
};

export default Welcome;
