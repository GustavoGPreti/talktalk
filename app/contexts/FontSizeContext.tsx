'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Defines the shape of the font size context.
 */
interface FontSizeContextType {
  fontSize: number;
  setFontSize: (size: number) => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

/**
 * Provides a context for managing the application's font size.
 * It allows setting and persisting the font size across the application.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to be rendered within the provider.
 */
export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<number>(16);

  /**
   * Sets the font size, clamping the value between 8px and 24px.
   * Updates the component state, the root element's style, and localStorage.
   * @param {number} size - The desired font size in pixels.
   */
  const setFontSize = (size: number) => {
    const clampedSize = Math.min(Math.max(size, 8), 24); // Clamps the font size between 8px and 24px.
    setFontSizeState(clampedSize);
    document.documentElement.style.fontSize = `${clampedSize}px`;
    localStorage.setItem('talktalk_font_size', clampedSize.toString());
  };

  useEffect(() => {
    const savedSize = localStorage.getItem('talktalk_font_size');
    if (savedSize) {
      const size = Number(savedSize);
      if (size >= 8 && size <= 24) {
        setFontSize(size);
      }
    }
  }, []);

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}

/**
 * Custom hook to access the FontSizeContext.
 * @returns {FontSizeContextType} The font size context.
 * @throws {Error} If used outside of a FontSizeProvider.
 */
export function useFontSize() {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
}
