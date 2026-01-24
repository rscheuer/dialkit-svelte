import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  unit,
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isValueHovered, setIsValueHovered] = useState(false);
  const [isValueEditable, setIsValueEditable] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const percentage = ((value - min) / (max - min)) * 100;
  const isAtMinimum = value <= min;
  const isActive = isInteracting || isHovered;

  const positionToValue = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return value;
      const rect = trackRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      const rawValue = min + percent * (max - min);
      return Math.max(min, Math.min(max, rawValue));
    },
    [min, max, value]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (showInput) return;
      e.preventDefault();
      setIsInteracting(true);
      onChange(positionToValue(e.clientX));
    },
    [positionToValue, onChange, showInput]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isInteracting) return;
      if (!isDragging) setIsDragging(true);
      onChange(positionToValue(e.clientX));
    },
    [isInteracting, isDragging, positionToValue, onChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsInteracting(false);
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (showInput) return;
      e.preventDefault();
      setIsInteracting(true);
      const touch = e.touches[0];
      onChange(positionToValue(touch.clientX));
    },
    [positionToValue, onChange, showInput]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isInteracting) return;
      if (!isDragging) setIsDragging(true);
      const touch = e.touches[0];
      onChange(positionToValue(touch.clientX));
    },
    [isInteracting, isDragging, positionToValue, onChange]
  );

  const handleTouchEnd = useCallback(() => {
    setIsInteracting(false);
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isInteracting) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isInteracting, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Handle value hover delay for editable state
  useEffect(() => {
    if (isValueHovered && !showInput && !isValueEditable) {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsValueEditable(true);
      }, 800);
    } else if (!isValueHovered && !showInput) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      setIsValueEditable(false);
    }
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [isValueHovered, showInput, isValueEditable]);

  // Focus input when it appears
  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [showInput]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputSubmit = () => {
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
    }
    setShowInput(false);
    setIsValueHovered(false);
    setIsValueEditable(false);
  };

  const handleValueClick = (e: React.MouseEvent) => {
    if (isValueEditable) {
      e.stopPropagation();
      e.preventDefault();
      setShowInput(true);
      setInputValue(step >= 1 ? value.toFixed(0) : value.toFixed(2));
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputSubmit();
    } else if (e.key === 'Escape') {
      setShowInput(false);
      setIsValueHovered(false);
    }
  };

  const handleInputBlur = () => {
    handleInputSubmit();
  };

  const displayValue = step >= 1 ? value.toFixed(0) : value.toFixed(2);
  const shouldAnimate = !isDragging;
  const transition = shouldAnimate
    ? { type: 'spring' as const, visualDuration: 0.3, bounce: 0.15 }
    : { duration: 0 };

  const handleLeft = isAtMinimum ? 7 : `calc(${percentage}% - 9px)`;
  const fillBackground = isActive
    ? 'rgba(255, 255, 255, 0.15)'
    : 'rgba(255, 255, 255, 0.11)';

  const hashMarks = Array.from({ length: 7 }, (_, i) => (
    <span key={i} className="dialkit-slider-hashmark">•</span>
  ));

  return (
    <div
      ref={trackRef}
      className={`dialkit-slider ${isActive ? 'dialkit-slider-active' : ''}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="dialkit-slider-hashmarks">{hashMarks}</div>

      <motion.div
        className="dialkit-slider-fill"
        style={{ background: fillBackground, width: `${percentage}%`, transition: 'background 0.15s' }}
        animate={{ width: `${percentage}%` }}
        transition={transition}
      />

      <motion.div
        className="dialkit-slider-handle"
        style={{
          background: isInteracting ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.5)',
          left: handleLeft,
          opacity: isActive ? 1 : 0,
        }}
        animate={{ left: handleLeft, opacity: isActive ? 1 : 0 }}
        transition={transition}
      />

      <span className="dialkit-slider-label">
        {label}
      </span>

      {showInput ? (
        <input
          ref={inputRef}
          type="text"
          className="dialkit-slider-input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          className={`dialkit-slider-value ${isValueEditable ? 'dialkit-slider-value-editable' : ''}`}
          onMouseEnter={() => setIsValueHovered(true)}
          onMouseLeave={() => setIsValueHovered(false)}
          onClick={handleValueClick}
          onMouseDown={(e) => isValueEditable && e.stopPropagation()}
          style={{ cursor: isValueEditable ? 'text' : 'default' }}
        >
          {displayValue}{unit}
        </span>
      )}
    </div>
  );
}
