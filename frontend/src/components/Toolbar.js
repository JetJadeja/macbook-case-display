import React from 'react';
import './Toolbar.css';

/**
 * Toolbar Component
 *
 * Control panel for all drawing and text tools
 * Features:
 * - Unified color picker for both brush and text
 * - Brush size control
 * - Font size control
 * - Add text box button
 * - Clear canvas button
 *
 * @param {Object} props
 * @param {string} props.color - Unified color for both brush and text
 * @param {Function} props.onColorChange - Callback when color changes
 * @param {number} props.brushSize - Current brush size (1-50)
 * @param {Function} props.onBrushSizeChange - Callback when brush size changes
 * @param {number} props.fontSize - Current font size (8-72)
 * @param {Function} props.onFontSizeChange - Callback when font size changes
 * @param {Function} props.onAddTextBox - Callback to add a new text box
 * @param {Function} props.onClear - Callback to clear canvas
 */
const Toolbar = ({
  color,
  onColorChange,
  brushSize,
  onBrushSizeChange,
  fontSize,
  onFontSizeChange,
  onAddTextBox,
  onClear
}) => {
  /**
   * Predefined color palette for quick selection
   */
  const colorPalette = [
    '#000000', // Black
    '#FFFFFF', // White
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFA500', // Orange
    '#800080', // Purple
    '#FFC0CB', // Pink
    '#A52A2A'  // Brown
  ];

  return (
    <div className="toolbar">
      {/* ===== UNIFIED COLOR CONTROL ===== */}
      <div className="toolbar-section">
        <h3 className="toolbar-title">Color</h3>

        {/* Color palette quick select */}
        <div className="color-palette">
          {colorPalette.map(paletteColor => (
            <button
              key={paletteColor}
              className={`color-swatch ${color === paletteColor ? 'active' : ''}`}
              style={{ backgroundColor: paletteColor }}
              onClick={() => onColorChange(paletteColor)}
              title={paletteColor}
            />
          ))}
        </div>

        {/* Custom color picker */}
        <div className="color-picker-container">
          <label htmlFor="color-picker">Custom:</label>
          <input
            id="color-picker"
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="color-picker"
          />
          <span className="color-value">{color}</span>
        </div>
      </div>

      <div className="toolbar-section">
        <h3 className="toolbar-title">Brush Size</h3>
        <div className="slider-container">
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => onBrushSizeChange(Number(e.target.value))}
            className="slider"
          />
          <span className="slider-value">{brushSize}px</span>
        </div>

        {/* Visual preview of brush size */}
        <div className="brush-preview">
          <div
            className="brush-preview-dot"
            style={{
              width: `${brushSize}px`,
              height: `${brushSize}px`,
              backgroundColor: color
            }}
          />
        </div>
      </div>

      {/* ===== TEXT SIZE CONTROL ===== */}

      <div className="toolbar-section">
        <h3 className="toolbar-title">Font Size</h3>
        <div className="slider-container">
          <input
            type="range"
            min="8"
            max="72"
            value={fontSize}
            onChange={(e) => onFontSizeChange(Number(e.target.value))}
            className="slider"
          />
          <span className="slider-value">{fontSize}px</span>
        </div>

        {/* Visual preview of text */}
        <div className="text-preview">
          <span
            style={{
              fontSize: `${fontSize}px`,
              color: color
            }}
          >
            Sample Text
          </span>
        </div>
      </div>

      {/* ===== ACTIONS ===== */}
      <div className="toolbar-section">
        <button
          className="add-textbox-button"
          onClick={onAddTextBox}
          title="Add a new text box"
        >
          ➕ Add Text Box
        </button>

        <button
          className="clear-button"
          onClick={onClear}
          title="Clear entire canvas"
        >
          🗑️ Clear Canvas
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
