import React, { useState } from 'react';
import './QuantitySelector.css';

const QuantitySelector = ({ 
  minQty = 100, 
  maxQty = 5000, 
  step = 10,
  onQuantityChange 
}) => {
  const [quantity, setQuantity] = useState(minQty); // Auto sets to 100

  const handleIncrement = () => {
    if (quantity + step <= maxQty) {
      const newQty = quantity + step;
      setQuantity(newQty);
      onQuantityChange?.(newQty);
    }
  };

  const handleDecrement = () => {
    if (quantity - step >= minQty) {
      const newQty = quantity - step;
      setQuantity(newQty);
      onQuantityChange?.(newQty);
    }
  };

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= minQty && value <= maxQty) {
      setQuantity(value);
      onQuantityChange?.(value);
    }
  };

  return (
    <div className="quantity-selector">
      <label className="quantity-label">Quantity (Min: {minQty})</label>
      <div className="quantity-controls">
        <button 
          onClick={handleDecrement}
          className="quantity-btn"
          disabled={quantity <= minQty}
        >
          -
        </button>
        <input
          type="number"
          value={quantity}
          onChange={handleInputChange}
          className="quantity-input"
          min={minQty}
          max={maxQty}
          step={step}
        />
        <button 
          onClick={handleIncrement}
          className="quantity-btn"
          disabled={quantity >= maxQty}
        >
          +
        </button>
      </div>
      <div className="quantity-info">
        <span className="text-glow">MOQ: {minQty} pieces</span>
        <span className="text-gray">Available: 5000 pieces</span>
      </div>
    </div>
  );
};

export default QuantitySelector;