import { useState, useRef } from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import './App.css';

/**
 * CaseCanvas Application
 *
 * Main application component that orchestrates:
 * - User name input
 * - Drawing canvas with freehand drawing and text placement
 * - Tool controls and settings
 * - Submission to backend
 *
 * Data flow:
 * 1. User enters name
 * 2. User draws/adds text via Canvas component
 * 3. User clicks submit
 * 4. Canvas exports drawing as base64 image + text box data
 * 5. All data sent to backend
 */
function App() {
  // ===== USER INFO STATE =====
  const [name, setName] = useState('');
  const [showCanvas, setShowCanvas] = useState(false);

  // ===== TOOL STATE =====
  const [currentTool, setCurrentTool] = useState('draw');

  // ===== DRAWING STATE =====
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);

  // ===== TEXT STATE =====
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(24);

  // ===== CANVAS DATA STATE =====
  const [canvasData, setCanvasData] = useState(null);

  // ===== SUBMISSION STATE =====
  const [submitted, setSubmitted] = useState(false);

  // ===== REFS =====
  const canvasContainerRef = useRef(null);

  /**
   * Handle name form submission
   * Advances user to canvas drawing interface
   */
  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      setShowCanvas(true);
    }
  };

  /**
   * Handle canvas data changes
   * Stores latest canvas state for submission
   */
  const handleCanvasDataChange = (data) => {
    setCanvasData(data);
  };

  /**
   * Handle clear canvas
   * Triggers clear method in Canvas component
   */
  const handleClearCanvas = () => {
    if (canvasContainerRef.current && canvasContainerRef.current.clearCanvas) {
      canvasContainerRef.current.clearCanvas();
    }
  };

  /**
   * Handle final submission
   * Sends all data to backend
   */
  const handleSubmit = async () => {
    if (!canvasData) {
      alert('Please draw or add text before submitting!');
      return;
    }

    // Prepare submission payload
    const payload = {
      name: name,
      canvasImage: canvasData.canvasImage, // base64 PNG
      textBoxes: canvasData.textBoxes,      // Array of text box data
      timestamp: new Date().toISOString()
    };

    console.log('Submitting to backend:', {
      name: payload.name,
      textBoxCount: payload.textBoxes.length,
      imageSize: payload.canvasImage.length,
      timestamp: payload.timestamp
    });

    try {
      // TODO: Replace with actual backend endpoint
      // await fetch('/api/submit', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // });

      setSubmitted(true);

      // Reset after 3 seconds
      setTimeout(() => {
        setName('');
        setShowCanvas(false);
        setSubmitted(false);
        setCanvasData(null);
      }, 3000);
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Failed to submit. Please try again.');
    }
  };

  /**
   * Handle back button (return to name input)
   */
  const handleBack = () => {
    if (window.confirm('Are you sure? Your drawing will be lost.')) {
      setShowCanvas(false);
      setCanvasData(null);
    }
  };

  // ===== RENDER SUCCESS MESSAGE =====
  if (submitted) {
    return (
      <div className="App">
        <div className="container">
          <div className="success-message">
            <h1>✨ Sent Successfully! ✨</h1>
            <p>Your creation will appear on the display soon.</p>
            <p className="success-name">From: {name}</p>
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDER NAME INPUT =====
  if (!showCanvas) {
    return (
      <div className="App">
        <div className="container name-container">
          <h1 className="title">CaseCanvas</h1>
          <p className="subtitle">Draw, type, and share on the display</p>

          <form onSubmit={handleNameSubmit} className="name-form">
            <div className="form-group">
              <label htmlFor="name">What's your name?</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                autoFocus
              />
            </div>

            <button type="submit" className="submit-button">
              Start Creating →
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ===== RENDER CANVAS INTERFACE =====
  return (
    <div className="App canvas-app">
      {/* Header with name and back button */}
      <header className="canvas-header">
        <div className="header-content">
          <h1 className="canvas-title">CaseCanvas</h1>
          <span className="user-name">Creating as: {name}</span>
          <button onClick={handleBack} className="back-button">
            ← Back
          </button>
        </div>
      </header>

      {/* Main canvas and toolbar area */}
      <div className="canvas-layout">
        {/* Left sidebar: Toolbar */}
        <aside className="sidebar">
          <Toolbar
            currentTool={currentTool}
            onToolChange={setCurrentTool}
            brushColor={brushColor}
            onBrushColorChange={setBrushColor}
            brushSize={brushSize}
            onBrushSizeChange={setBrushSize}
            textColor={textColor}
            onTextColorChange={setTextColor}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            onClear={handleClearCanvas}
          />
        </aside>

        {/* Center: Canvas */}
        <main className="canvas-main">
          <div ref={canvasContainerRef}>
            <Canvas
              currentTool={currentTool}
              brushColor={brushColor}
              brushSize={brushSize}
              textColor={textColor}
              fontSize={fontSize}
              onDataChange={handleCanvasDataChange}
            />
          </div>

          {/* Submit button */}
          <div className="canvas-footer">
            <button
              onClick={handleSubmit}
              className="submit-button submit-canvas"
            >
              Send to Display 🚀
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
