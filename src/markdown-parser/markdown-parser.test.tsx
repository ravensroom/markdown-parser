import { getDefaultNormalizer, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import handleMarkdown from './markdown-parser';

describe('span-level parsing - inside-one-line: bold, italic, strike-through, inline-code, link', () => {
  describe("for markdown content that's not part of a list", () => {
    const md =
      'This is **bold** and *italic* and ~~strike-through~~ and `inline-code` and [link](https://www.google.com).';
    const parsed = <div data-testid="container">{handleMarkdown(md)}</div>;

    beforeEach(() => {
      render(parsed);
    });

    test('non-styled texts and spaces should be preserved exactly as they are', () => {
      expect(
        screen.getByText('This is ', {
          normalizer: getDefaultNormalizer({ trim: false }),
        })
      ).toBeInTheDocument();
      expect(
        screen.getAllByText(' and ', {
          normalizer: getDefaultNormalizer({ trim: false }),
        }).length
      ).toBe(4);
      expect(screen.getByText('.')).toBeInTheDocument();
    });

    test('bold', () => {
      const boldElement = screen.getByText('bold');
      expect(boldElement).toBeInTheDocument();
      expect(boldElement).toHaveStyle('font-weight: 500');
    });

    test('italic', () => {
      const italicElement = screen.getByText('italic');
      expect(italicElement).toBeInTheDocument();
      expect(italicElement).toHaveStyle('font-style: italic');
    });

    test('strike-through', () => {
      const strikeThroughElement = screen.getByText('strike-through');
      expect(strikeThroughElement).toBeInTheDocument();
      expect(strikeThroughElement).toHaveStyle('text-decoration: line-through');
    });

    test('inline-code', () => {
      const inlineCodeElement = screen.getByText('inline-code');
      expect(inlineCodeElement).toBeInTheDocument();
      expect(inlineCodeElement).toHaveStyle('font-family: monospace');
    });

    test('link', () => {
      const linkElement = screen.getByText('link');
      expect(linkElement).toBeInTheDocument();
      expect(linkElement).toHaveAttribute('href', 'https://www.google.com');
    });
  });

  describe('for markdown content that is part of a list', () => {
    const md =
      '- This is **bold** and *italic* and ~~strike-through~~ and `inline-code` and [link](https://www.google.com).';
    const parsed = <div data-testid="container">{handleMarkdown(md)}</div>;

    beforeEach(() => {
      render(parsed);
    });

    test('non-styled texts and spaces should be preserved exactly as they are', () => {
      expect(
        screen.getByText('This is ', {
          normalizer: getDefaultNormalizer({ trim: false }),
        })
      ).toBeInTheDocument();
      expect(
        screen.getAllByText(' and ', {
          normalizer: getDefaultNormalizer({ trim: false }),
        }).length
      ).toBe(4);
      expect(screen.getByText('.')).toBeInTheDocument();
    });

    test('bold', () => {
      const boldElement = screen.getByText('bold');
      expect(boldElement).toBeInTheDocument();
      expect(boldElement).toHaveStyle('font-weight: 500');
    });

    test('italic', () => {
      const italicElement = screen.getByText('italic');
      expect(italicElement).toBeInTheDocument();
      expect(italicElement).toHaveStyle('font-style: italic');
    });

    test('strike-through', () => {
      const strikeThroughElement = screen.getByText('strike-through');
      expect(strikeThroughElement).toBeInTheDocument();
      expect(strikeThroughElement).toHaveStyle('text-decoration: line-through');
    });

    test('inline-code', () => {
      const inlineCodeElement = screen.getByText('inline-code');
      expect(inlineCodeElement).toBeInTheDocument();
      expect(inlineCodeElement).toHaveStyle('font-family: monospace');
    });

    test('link', () => {
      const linkElement = screen.getByText('link');
      expect(linkElement).toBeInTheDocument();
      expect(linkElement).toHaveAttribute('href', 'https://www.google.com');
    });
  });

  describe('special styles inside a styled span should be ignored', () => {
    test('no parsing of styles inside inline-code', () => {
      const md =
        'This is `inline code block with **bold** and *italic* and ~~strike-through~~ and [link](https://www.google.com)` inside.';
      const parsed = <div data-testid="container">{handleMarkdown(md)}</div>;
      render(parsed);
      expect(
        screen.getByText(
          'inline code block with **bold** and *italic* and ~~strike-through~~ and [link](https://www.google.com)'
        )
      ).toBeInTheDocument();
    });

    test('no parsing of styles inside boldness', () => {
      const md = `This is **boldness with *italic* and ~~strike-through~~ and [link](https://www.google.com)** inside.`;
      const parsed = <div data-testid="container">{handleMarkdown(md)}</div>;
      render(parsed);
      expect(
        screen.getByText(
          'boldness with *italic* and ~~strike-through~~ and [link](https://www.google.com)'
        )
      ).toBeInTheDocument();
    });
  });
});
