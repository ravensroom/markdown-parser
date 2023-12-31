import { fireEvent, getDefaultNormalizer, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import handleMarkdown from './markdown-parser';

// if table and code block have spaces before them, do we want to render as code block and table?
// if there are inline styles in header, blockquote, table or other inline styles, do we want to do furthur parsing?
// how to write tests for md content that's being streamed in?

describe('unordered list parsing', () => {
  describe('should render single level lists', () => {
    const md = `
- Item 1
Content of item 1
- Item 2
- Item 3
`;
    const parsed = <div data-testid="container">{handleMarkdown(md)}</div>;

    beforeEach(() => {
      render(parsed);
    });

    test('should render list items', () => {
      const listElements = screen.getAllByRole('listitem');
      expect(listElements.length).toBe(3);
      test('should verify that list items are rendered with bullets', () => {
        listElements.forEach((listItem) => {
          const firstChild = listItem.firstChild;
          expect(firstChild).toHaveTextContent('•');
        });
      });
    });
    test('should render un-bullited lines as is', () => {
      // test('non-list items should be rendered without bullets', () => {
      const nonListItems = screen.getAllByText('Content of item 1');
      expect(nonListItems.length).toBe(1);
      nonListItems.forEach((nonListItem) => {
        const firstChild = nonListItem.firstChild;
        expect(firstChild).not.toHaveTextContent('•');
        expect(firstChild).toHaveTextContent('Content of item 1');
      });
    });
  });
  describe('should render nested lists', () => {
    const md = `
- Item 1
    - Item 1.1
    - Item 1.2
- Item 2
- Item 3
`;
    const parsed = <div data-testid="container">{handleMarkdown(md)}</div>;

    beforeEach(() => {
      render(parsed);
    });

    test('should render proper indentation for nested list', () => {
      const listElements = screen.getAllByRole('listitem');
      expect(listElements.length).toBe(5);
      listElements.forEach((listItem, index) => {
        const firstChild = listItem.firstChild;
        expect(firstChild).toBeInTheDocument();
        expect(firstChild).toHaveTextContent('•');

        if (index === 1 || index === 2) {
          const precedingSpaces = 4;
          const marginLeft = `${5 + precedingSpaces * 12}px`;
          expect(listItem).toHaveStyle(`margin-left: ${marginLeft}`);
        }
      });
    });
  });
});

describe('ordered list parsing', () => {
  describe('should ordered list with no nested list', () => {
    const md = `
1. Item 1
Content of item 1
2. Item 2
3. Item 3
`;
    const parsed = <div data-testid="container">{handleMarkdown(md)}</div>;

    beforeEach(() => {
      render(parsed);
    });

    test('list items should be rendered and as ordered', () => {
      const listElements = screen.getAllByRole('listitem');
      expect(listElements.length).toBe(3);
      listElements.forEach((listItem, index) => {
        const firstChild = listItem.firstChild;
        expect(firstChild).toBeInTheDocument();
        expect(firstChild).toHaveTextContent(`${index + 1}.`);
      });
    });

    test('non-list items should be rendered without numbers', () => {
      const nonListItems = screen.getAllByText('Content of item 1');
      expect(nonListItems.length).toBe(1);
      nonListItems.forEach((nonListItem) => {
        const firstChild = nonListItem.firstChild;
        expect(firstChild).toHaveTextContent('Content of item 1');
      });
    });
  });
  describe('ordered list with nested lists', () => {
    const md = `
1. Item 1
    - Item 1.1
    - Item 1.2
2. Item 2
    1. Item 2.1
    2. Item 2.2
3. Item 3
`;
    const parsed = <div data-testid="container">{handleMarkdown(md)}</div>;

    beforeEach(() => {
      render(parsed);
    });

    test('nested list items should have proper indentation', () => {
      const listElements = screen.getAllByRole('listitem');
      expect(listElements.length).toBe(7);
      listElements.forEach((listItem, index) => {
        const firstChild = listItem.firstChild;
        expect(firstChild).toBeInTheDocument();

        if ([0, 3, 6].includes(index)) {
          expect(firstChild).toHaveTextContent(`${Math.floor(index / 3) + 1}.`);
        }
        if ([1, 2, 4, 5].includes(index)) {
          const precedingSpaces = 4;
          const marginLeft = `${5 + precedingSpaces * 12}px`;
          expect(listItem).toHaveStyle(`margin-left: ${marginLeft}`);
          if ([1, 2].includes(index)) {
            expect(firstChild).toHaveTextContent('•');
          }
          if ([4, 5].includes(index)) {
            expect(firstChild).toHaveTextContent(`${index - 3}.`);
          }
        }
      });
    });
  });
});

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

describe('block-level parsing - multi-line block: codeBlock, table', () => {
  describe('codeBlock', () => {
    const md = `\`\`\`js
const renderMessages = (): JSX.Element[] => {
    const viewMsgs = messages
      .filter((msgData: MsgType) => {
        if (!verboseMode && (msgData.type === 'CHAT_RESPONSE')) {
          return false;
        }
        return true;
      })
    return viewMsgs;
  };
\`\`\`
`;
    const code = md.split('\n').slice(1, -2);
    const parsed = <div data-testid="container">{handleMarkdown(md)}</div>;
    beforeEach(() => {
      render(parsed);
    });
    test('language header should be rendered with proper language name and a copy button', () => {
      expect(screen.getByText('js')).toBeInTheDocument();
      expect(screen.getByText('copy')).toBeInTheDocument();
    });

    test('copy button on the header should be functional', async () => {
      // Mock the navigator clipboard API
      const clipboardWriteText = jest.fn();
      Object.assign(navigator, {
        clipboard: {
          writeText: clipboardWriteText,
        },
      });

      const copyButton = screen.getByText('copy');
      fireEvent.click(copyButton);
      expect(clipboardWriteText).toHaveBeenCalledWith(code.join('\n'));
    });
  });

  describe('table', () => {
    const md = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`;
    const tableRows = md.split('\n');
    const headerRow = tableRows[0];
    const bodyRows = tableRows.slice(2);

    const parsed = <div data-testid="container">{handleMarkdown(md)}</div>;
    beforeEach(() => {
      render(parsed);
    });

    test('table header row should be rendered with proper header names', () => {
      const headerCells = screen.getAllByRole('columnheader');

      const headerNames = headerRow
        .split('|')
        .slice(1, -1)
        .map((cell) => cell.trim());

      headerCells.forEach((headerCell, index) => {
        expect(headerCell).toBeInTheDocument();
        expect(headerCell.textContent).toBe(headerNames[index]);
      });
    });

    test('table body rows should be rendered with proper cell values', () => {
      const bodyCells = screen.getAllByRole('cell');
      const cellValues = bodyRows.map((row) =>
        row
          .split('|')
          .slice(1, -1)
          .map((cell) => cell.trim())
      );

      bodyCells.forEach((bodyCell, index) => {
        expect(bodyCell).toBeInTheDocument();
        expect(bodyCell.textContent).toBe(cellValues[Math.floor(index / 2)][index % 2]);
      });
    });
  });
});

describe('verify single line block parsing', () => {
  /*
    import handleMarkdown,
    define multi line input.
    spy on parse
    call handleMarkdown with input.
    verify that parse is called with input with no newline.
  */
});
