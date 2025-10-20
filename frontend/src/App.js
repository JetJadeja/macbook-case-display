import { useState } from 'react';
import './App.css';

function App() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // TODO: Replace with actual backend endpoint
    const data = {
      name: name,
      message: message,
      timestamp: new Date().toISOString()
    };

    console.log('Submitting to backend:', data);

    // Simulated backend call
    try {
      // await fetch('/api/submit', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });

      setSubmitted(true);

      // Reset form after 2 seconds
      setTimeout(() => {
        setName('');
        setMessage('');
        setSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting:', error);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1 className="title">CaseCanvas</h1>
        <p className="subtitle">Share your message on the display</p>

        {submitted ? (
          <div className="success-message">
            <h2>Message sent! 🎉</h2>
            <p>Your message will appear on the display soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="message-form">
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Your Message</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                rows="5"
                required
              />
            </div>

            <button type="submit" className="submit-button">
              Send to Display
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default App;
