// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// A helper component that throws an error on render
const CrashingComponent = ({ shouldCrash }: { shouldCrash: boolean }) => {
  if (shouldCrash) {
    throw new Error('Test crash error');
  }
  return <div>Component is fine</div>;
};

describe('ErrorBoundary Component', () => {
  it('renders children normally when no error is thrown', () => {
    render(
      <ErrorBoundary componentName="TestComp">
        <CrashingComponent shouldCrash={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Component is fine')).toBeDefined();
  });

  it('catches errors and renders fallback UI with retry button', () => {
    // Suppress console.error logging for this test block
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { rerender } = render(
      <ErrorBoundary componentName="TestComp">
        <CrashingComponent shouldCrash={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Failed to load TestComp')).toBeDefined();
    expect(screen.getByText('Test crash error')).toBeDefined();
    expect(screen.getByText('Try Again')).toBeDefined();

    // Verify reset works by rerendering with shouldCrash=false and clicking retry
    rerender(
      <ErrorBoundary componentName="TestComp">
        <CrashingComponent shouldCrash={false} />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText('Try Again'));
    expect(screen.getByText('Component is fine')).toBeDefined();

    spy.mockRestore();
  });
});
