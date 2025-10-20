import React from 'react';
import './Toolbar.css';

/**
 * Toolbar Component
 *
 * Control panel for all drawing and text tools
 * Features:
 * - Brush color and size controls
 * - Add text box button
 * - Text color and font size controls
 * - Clear canvas button
 *
 * @param {Object} props
 * @param {string} props.brushColor - Current brush color
 * @param {Function} props.onBrushColorChange - Callback when brush color changes
 * @param {number} props.brushSize - Current brush size (1-50)
 * @param {Function} props.onBrushSizeChange - Callback when brush size changes
 * @param {string} props.textColor - Current text color
 * @param {Function} props.onTextColorChange - Callback when text color changes
 * @param {number} props.fontSize - Current font size (8-72)
 * @param {Function} props.onFontSizeChange - Callback when font size changes
 * @param {Function} props.onAddTextBox - Callback to add a new text box
 * @param {Function} props.onClear - Callback to clear canvas
 */
const Toolbar = ({
  brushColor,
  onBrushColorChange,
  brushSize,
  onBrushSizeChange,
  textColor,
  onTextColorChange,
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
      {/* ===== DRAWING CONTROLS ===== */}
      <div className="toolbar-section">
        <h3 className="toolbar-title">Brush Color</h3>

        {/* Color palette quick select */}
        <div className="color-palette">
          {colorPalette.map(paletteColor => (
            <button
              key={paletteColor}
              className={`color-swatch ${brushColor === paletteColor ? 'active' : ''}`}
              style={{ backgroundColor: paletteColor }}
              onClick={() => onBrushColorChange(paletteColor)}
              title={paletteColor}
            />
          ))}
        </div>

        {/* Custom color picker */}
        <div className="color-picker-container">
          <label htmlFor="brush-color-picker">Custom:</label>
          <input
            id="brush-color-picker"
            type="color"
            value={brushColor}
            onChange={(e) => onBrushColorChange(e.target.value)}
            className="color-picker"
          />
          <span className="color-value">{brushColor}</span>
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
              backgroundColor: brushColor
            }}
          />
        </div>
      </div>

      {/* ===== TEXT CONTROLS ===== */}
      <div className="toolbar-section">
        <h3 className="toolbar-title">Text Color</h3>

        {/* Color palette quick select */}
        <div className="color-palette">
          {colorPalette.map(paletteColor => (
            <button
              key={paletteColor}
              className={`color-swatch ${textColor === paletteColor ? 'active' : ''}`}
              style={{ backgroundColor: paletteColor }}
              onClick={() => onTextColorChange(paletteColor)}
              title={paletteColor}
            />
          ))}
        </div>

        {/* Custom color picker */}
        <div className="color-picker-container">
          <label htmlFor="text-color-picker">Custom:</label>
          <input
            id="text-color-picker"
            type="color"
            value={textColor}
            onChange={(e) => onTextColorChange(e.target.value)}
            className="color-picker"
          />
          <span className="color-value">{textColor}</span>
        </div>
      </div>

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
              color: textColor
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
