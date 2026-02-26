import { render, screen, fireEvent } from '@testing-library/react';
import Grid from './Grid';
import { describe, it, expect, vi } from 'vitest';

describe('Grid Component', () => {
  const mockProps = {
    grid: [
      ['A', 'B'],
      ['C', 'D']
    ],
    selection: [] as [number, number][],
    onSelectionStart: vi.fn(),
    onSelectionMove: vi.fn(),
    onSelectionEnd: vi.fn(),
    foundWords: [],
    spangram: { text: "SPAN", path: [] as [number, number][] },
    hintState: {},
    themeWords: []
  };

  it('should render letters', () => {
    render(<Grid {...mockProps} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('should call onSelectionStart on pointer down', () => {
    render(<Grid {...mockProps} />);
    const cellA = screen.getByText('A');
    fireEvent.pointerDown(cellA);
    expect(mockProps.onSelectionStart).toHaveBeenCalled();
  });

  it('should call onSelectionMove on pointer enter when down', () => {
    render(<Grid {...mockProps} />);
    const cellA = screen.getByText('A');
    const cellB = screen.getByText('B');
    
    fireEvent.pointerDown(cellA);
    fireEvent.pointerEnter(cellB);
    
    expect(mockProps.onSelectionMove).toHaveBeenCalled();
  });
});
