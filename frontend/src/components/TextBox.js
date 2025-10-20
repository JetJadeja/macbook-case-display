import React, { useState, useRef, useEffect } from 'react';
import './TextBox.css';

/**
 * TextBox Component
 *
 * A draggable, editable text element that overlays the canvas
 * Features:
 * - Click to edit text
 * - Drag to reposition
 * - Customizable color and font size
 * - Delete button
 *
 * @param {Object} props
 * @param {number} props.id - Unique identifier for this text box
 * @param {string} props.text - Current text content
 * @param {Object} props.position - {x, y} coordinates
 * @param {string} props.color - Text color (hex or CSS color)
 * @param {number} props.fontSize - Font size in pixels
 * @param {Function} props.onUpdate - Callback when text/position changes
 * @param {Function} props.onDelete - Callback to delete this text box
 */
const TextBox = ({
  id,
  text,
  position,
  color,
  fontSize,
  onUpdate,
  onDelete
}) => {
  // ===== STATE =====
  const [isEditing, setIsEditing] = useState(text === ''); // Auto-edit new boxes
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // ===== REFS =====
  const textBoxRef = useRef(null);
  const inputRef = useRef(null);

  /**
   * Auto-focus input when entering edit mode
   */
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  /**
   * Handle text input changes
   */
  const handleTextChange = (event) => {
    onUpdate(id, { text: event.target.value });
  };

  /**
   * Handle Enter key to finish editing
   * Handle Escape key to cancel editing (keep text)
   */
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setIsEditing(false);

      // Delete if text is empty
      if (!text.trim()) {
        onDelete(id);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setIsEditing(false);
    }
  };

  /**
   * Click handler: toggle edit mode
   * Only if not currently dragging
   */
  const handleClick = (event) => {
    if (!isDragging) {
      event.stopPropagation();
      setIsEditing(true);
    }
  };

  /**
   * Blur handler: exit edit mode
   * Delete text box if empty
   */
  const handleBlur = () => {
    setIsEditing(false);

    if (!text.trim()) {
      onDelete(id);
    }
  };

  /**
   * Start dragging
   * Record offset between mouse and text box position
   */
  const handleMouseDown = (event) => {
    if (isEditing) return;

    event.preventDefault();
    event.stopPropagation();

    const rect = textBoxRef.current.getBoundingClientRect();
    setDragOffset({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
    setIsDragging(true);
  };

  /**
   * Handle dragging motion
   * Calculate new position relative to canvas container
   */
  const handleMouseMove = (event) => {
    if (!isDragging) return;

    event.preventDefault();

    // Get canvas container bounds
    const canvasContainer = textBoxRef.current.parentElement;
    const containerRect = canvasContainer.getBoundingClientRect();

    // Calculate new position (relative to container)
    const newX = event.clientX - containerRect.left - dragOffset.x;
    const newY = event.clientY - containerRect.top - dragOffset.y;

    // Keep text box within canvas bounds
    const boxWidth = textBoxRef.current.offsetWidth;
    const boxHeight = textBoxRef.current.offsetHeight;

    const boundedX = Math.max(0, Math.min(newX, containerRect.width - boxWidth));
    const boundedY = Math.max(0, Math.min(newY, containerRect.height - boxHeight));

    onUpdate(id, {
      position: { x: boundedX, y: boundedY }
    });
  };

  /**
   * Stop dragging
   */
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  /**
   * Handle delete button click
   */
  const handleDelete = (event) => {
    event.stopPropagation();
    onDelete(id);
  };

  /**
   * Attach/detach global mouse event listeners for dragging
   */
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, id, onUpdate]);

  return (
    <div
      ref={textBoxRef}
      className={`text-box ${isEditing ? 'editing' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        color: color,
        fontSize: `${fontSize}px`
      }}
      onMouseDown={handleMouseDown}
    >
      {isEditing ? (
        // Edit mode: show input field
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="text-box-input"
          placeholder="Type text..."
          style={{
            color: color,
            fontSize: `${fontSize}px`
          }}
        />
      ) : (
        // Display mode: show text with click to edit
        <>
          <div
            className="text-box-content"
            onClick={handleClick}
          >
            {text || 'Click to edit'}
          </div>

          {/* Delete button (only visible on hover) */}
          <button
            className="text-box-delete"
            onClick={handleDelete}
            title="Delete text"
          >
            ×
          </button>
        </>
      )}
    </div>
  );
};

export default TextBox;
