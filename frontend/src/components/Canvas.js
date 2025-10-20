import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import TextBox from './TextBox';
import './Canvas.css';

/**
 * Canvas Component
 *
 * Main drawing surface that handles:
 * - Freehand drawing with HTML5 Canvas API
 * - Text box overlay management
 * - Mouse and touch event handling
 * - Tool mode coordination (draw vs text)
 *
 * @param {Object} props
 * @param {string} props.currentTool - Active tool mode ('draw' or 'text')
 * @param {string} props.brushColor - Current brush color for drawing
 * @param {number} props.brushSize - Current brush size in pixels
 * @param {string} props.textColor - Current text color for new text boxes
 * @param {number} props.fontSize - Current font size for new text boxes
 * @param {Function} props.onDataChange - Callback when canvas data changes
 * @param {React.Ref} ref - Forwarded ref to expose methods to parent
 */
const Canvas = forwardRef(({
  currentTool,
  brushColor,
  brushSize,
  textColor,
  fontSize,
  onDataChange
}, ref) => {
  // ===== REFS =====
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const containerRef = useRef(null);

  // ===== DRAWING STATE =====
  const [isDrawing, setIsDrawing] = useState(false);

  // ===== TEXT BOX STATE =====
  const [textBoxes, setTextBoxes] = useState([]);
  const [nextTextBoxId, setNextTextBoxId] = useState(1);

  /**
   * Initialize canvas and set up drawing context
   * Runs once on component mount
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to match container
    const container = containerRef.current;
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    // Initialize 2D context with drawing settings
    const context = canvas.getContext('2d');
    context.lineCap = 'round'; // Smooth line endings
    context.lineJoin = 'round'; // Smooth line corners
    contextRef.current = context;

    // Fill with white background
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  /**
   * Update brush settings when they change
   */
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = brushColor;
      contextRef.current.lineWidth = brushSize;
    }
  }, [brushColor, brushSize]);

  /**
   * Notify parent component of data changes
   */
  useEffect(() => {
    if (onDataChange && canvasRef.current) {
      onDataChange({
        canvasImage: canvasRef.current.toDataURL('image/png'),
        textBoxes: textBoxes
      });
    }
  }, [textBoxes, onDataChange]);

  /**
   * Get mouse position relative to canvas
   * Accounts for canvas offset in the page
   */
  const getMousePosition = useCallback((event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }, []);

  /**
   * Get touch position relative to canvas
   * Accounts for canvas offset in the page
   */
  const getTouchPosition = useCallback((event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  }, []);

  /**
   * Start drawing on mouse down
   * Begins a new drawing path
   */
  const startDrawing = useCallback((event) => {
    const pos = getMousePosition(event);
    contextRef.current.beginPath();
    contextRef.current.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  }, [getMousePosition]);

  /**
   * Draw as mouse moves
   * Only active when isDrawing is true
   */
  const draw = useCallback((event) => {
    if (!isDrawing) return;

    const pos = getMousePosition(event);
    contextRef.current.lineTo(pos.x, pos.y);
    contextRef.current.stroke();
  }, [isDrawing, getMousePosition]);

  /**
   * Stop drawing on mouse up
   */
  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      contextRef.current.closePath();
      setIsDrawing(false);

      // Trigger data change callback
      if (onDataChange) {
        onDataChange({
          canvasImage: canvasRef.current.toDataURL('image/png'),
          textBoxes: textBoxes
        });
      }
    }
  }, [isDrawing, textBoxes, onDataChange]);

  /**
   * Touch event handlers for mobile support
   */
  const startTouchDrawing = useCallback((event) => {
    event.preventDefault();
    const pos = getTouchPosition(event);
    contextRef.current.beginPath();
    contextRef.current.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  }, [getTouchPosition]);

  const touchDraw = useCallback((event) => {
    if (!isDrawing) return;
    event.preventDefault();

    const pos = getTouchPosition(event);
    contextRef.current.lineTo(pos.x, pos.y);
    contextRef.current.stroke();
  }, [isDrawing, getTouchPosition]);

  const stopTouchDrawing = useCallback((event) => {
    if (isDrawing) {
      event.preventDefault();
      contextRef.current.closePath();
      setIsDrawing(false);

      if (onDataChange) {
        onDataChange({
          canvasImage: canvasRef.current.toDataURL('image/png'),
          textBoxes: textBoxes
        });
      }
    }
  }, [isDrawing, textBoxes, onDataChange]);

  /**
   * Update text box content
   */
  const updateTextBox = useCallback((id, updates) => {
    setTextBoxes(prev =>
      prev.map(box =>
        box.id === id ? { ...box, ...updates } : box
      )
    );
  }, []);

  /**
   * Delete a text box
   */
  const deleteTextBox = useCallback((id) => {
    setTextBoxes(prev => prev.filter(box => box.id !== id));
  }, []);

  /**
   * Clear entire canvas (drawing and text boxes)
   */
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;

    // Clear drawing
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Clear text boxes
    setTextBoxes([]);

    // Notify parent
    if (onDataChange) {
      onDataChange({
        canvasImage: canvas.toDataURL('image/png'),
        textBoxes: []
      });
    }
  }, [onDataChange]);

  /**
   * Create a new text box at a smart default position
   * Uses cascading offset to avoid overlapping text boxes
   */
  const createTextBox = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Start at center of canvas
    const baseX = canvas.width / 2 - 50;
    const baseY = canvas.height / 2 - 20;

    // Add cascading offset based on number of existing text boxes
    // Each new box is offset by 20px down and right
    const offset = textBoxes.length * 20;

    const newTextBox = {
      id: nextTextBoxId,
      text: '',
      position: {
        x: baseX + offset,
        y: baseY + offset
      },
      color: textColor,
      fontSize: fontSize
    };

    setTextBoxes(prev => [...prev, newTextBox]);
    setNextTextBoxId(prev => prev + 1);
  }, [textBoxes.length, nextTextBoxId, textColor, fontSize]);

  /**
   * Expose methods to parent component via ref
   * This allows parent to call clearCanvas() and createTextBox()
   */
  useImperativeHandle(ref, () => ({
    clearCanvas,
    createTextBox
  }), [clearCanvas, createTextBox]);

  return (
    <div
      ref={containerRef}
      className="canvas-container"
    >
      {/* HTML5 Canvas for freehand drawing */}
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startTouchDrawing}
        onTouchMove={touchDraw}
        onTouchEnd={stopTouchDrawing}
        style={{
          cursor: 'crosshair'
        }}
      />

      {/* Text boxes rendered as overlays */}
      {textBoxes.map(box => (
        <TextBox
          key={box.id}
          id={box.id}
          text={box.text}
          position={box.position}
          color={box.color}
          fontSize={box.fontSize}
          onUpdate={updateTextBox}
          onDelete={deleteTextBox}
        />
      ))}
    </div>
  );
});

// Display name for debugging
Canvas.displayName = 'Canvas';

export default Canvas;
