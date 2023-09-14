/* eslint-disable no-useless-escape */
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json';
import markdown from 'react-syntax-highlighter/dist/cjs/languages/prism/markdown';
import scss from 'react-syntax-highlighter/dist/cjs/languages/prism/scss';
// list of languages we want to support code highlighting
// checkout languaes supported by Prism: https://github.com/react-syntax-highlighter/react-syntax-highlighter/blob/master/AVAILABLE_LANGUAGES_PRISM.MD
import tsx from 'react-syntax-highlighter/dist/cjs/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript';
// checkout highlight themes by Prism: https://github.com/PrismJS/prism-themes
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import React from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';

SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('scss', scss);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('json', json);

export interface ParseOptions {
  langPrefix?: string;
  cb: {
    inCodeBlock: boolean;
    codeBlockLang: string | null;
    code: string[];
  };
  tb: {
    inTable: boolean;
    tableRows: string[];
  };
}

export function parse(
  line: string,
  options: ParseOptions,
  index = 0,
  inRecursion = false
): React.ReactNode | string | null {
  const { cb, tb } = options;
  const precedingSpaces = line.match(/^(\s+)/)?.[1].length || 0;
  const trimmedLine = line.trimStart();
  const marginLeft = `${precedingSpaces * 6}px`;

  // block-level parsing - multi-line block: codeBlock, table

  // check for code block
  if (/^```(\S+)?/.test(trimmedLine)) {
    cb.inCodeBlock = !cb.inCodeBlock;
    // code block starts, send render signal
    if (cb.inCodeBlock) {
      cb.codeBlockLang = trimmedLine.match(/^```(\S+)?/)?.[1] || '';
      return 'cb' + ',' + marginLeft;
    }

    // code block ends, clear up the code block state
    cb.code = [];
    cb.codeBlockLang = null;
    return null;
  }

  if (cb.inCodeBlock) {
    cb.code.push(line);
    return null;
  }

  // check for table
  if (/^\|(.+\|)+/.test(trimmedLine)) {
    if (!tb.inTable) {
      // table starts, send render signal
      tb.inTable = true;
      tb.tableRows.push(trimmedLine);
      return 'tb' + ',' + marginLeft;
    }
    tb.tableRows.push(trimmedLine);
    return null;
  }

  // not matching table format, clear up the table state
  if (tb.inTable) {
    tb.inTable = false;
    tb.tableRows = [];
    return null;
  }

  // block-level parsing - one-line block: h, li, blockquote, hr, img

  // check for header
  if (/^#{1,6}\s/.test(trimmedLine)) {
    const level = trimmedLine.match(/^#{1,6}/)?.[0].length || 0;
    const text = trimmedLine.replace(/^#{1,6}\s/, '');
    return (
      <div
        style={{
          marginLeft,
          fontSize: `${1.5 - level * 0.2}em`,
          fontWeight: 'bold',
          padding: '5px 0',
        }}>
        {parse(text, options, index + 1)}
      </div>
    );
  }

  // check for unordered list and nested unordered list
  if (/^(\*|-)\s/.test(trimmedLine)) {
    const text = trimmedLine.replace(/^(\*|-)\s/, '');

    return (
      <li className="flex gap-2 items-start" style={{ marginLeft }}>
        <span className="flex items-center">•</span>
        <span>{parse(text, options, index + 1)}</span>
      </li>
    );
  }

  // check for ordered list
  if (/^\d+\.\s/.test(trimmedLine)) {
    const number = trimmedLine.match(/^\d+/)?.[0];
    const text = trimmedLine.replace(/^\d+\.\s/, '');

    return (
      <li className="flex gap-2 items-start" style={{ marginLeft }}>
        <span className="flex items-center">{`${number}.`}</span>
        <span>{parse(text, options, index + 1)}</span>
      </li>
    );
  }

  // check for blockquote
  if (/^>\s/.test(trimmedLine)) {
    const text = trimmedLine.replace(/^>\s?/, '');
    return (
      <blockquote
        style={{
          marginLeft,
          paddingLeft: '10px',
          borderLeft: '2px solid #ddd',
          color: '#777',
        }}>
        {parse(text, options, index + 1)}
      </blockquote>
    );
  }

  // check for horizontal rule
  if (/^(\*{3,}|-{3,}|_{3,})$/.test(line)) {
    return <hr />;
  }

  // check for images(put this condition before links)
  if (/!\[([^\]]+)\]\(([^\)]+)\)/.test(trimmedLine)) {
    const match = trimmedLine.match(/!\[([^\]]+)\]\(([^\)]+)\)/);
    const alt = match?.[1];
    const src = match?.[2];
    return <img src={src} alt={alt} style={{ marginLeft }} />;
  }

  // span-level parsing - inside-one-line: bold, italic, strike-through, inline-code, link

  // check for inline code
  if (/`([^`]+)`/.test(trimmedLine)) {
    const { pre, target, post } = seperator(/`([^`]+)`/g, trimmedLine);

    const children = (
      <>
        <span>{parse(pre, options, index + 1, true)}</span>
        <span className="bg-gray-200 text-gray-600 text-xs rounded-[4px] px-1">
          {/* no futhur parsing for inline code */}
          <code>{target}</code>
        </span>
        <span>{parse(post, options, index + 1, true)}</span>
      </>
    );

    return inRecursion ? (
      <span key={`inlcd-${index}`} style={{ marginLeft }}>
        {children}
      </span>
    ) : (
      <div key={`inlcd-${index}`} style={{ marginLeft }}>
        {children}
      </div>
    );
  }

  // check for bold
  if (/\*\*(.*?)\*\*/.test(trimmedLine)) {
    const { pre, target, post } = seperator(/\*\*(.*?)\*\*/g, trimmedLine);
    const children = (
      <>
        <span>{parse(pre, options, index + 1, true)}</span>
        <span key={`bold-${target.slice(0, 5)}`} style={{ fontWeight: '600' }}>
          {/* keep parsing for bold content */}
          {/* to be implemented */}
          {target}
        </span>
        <span>{parse(post, options, index + 1, true)}</span>
      </>
    );
    return inRecursion ? (
      <span style={{ marginLeft }}>{children}</span>
    ) : (
      <div style={{ marginLeft }}>{children}</div>
    );
  }

  // check for italic
  if (/\*(.*?)\*/.test(trimmedLine)) {
    const { pre, target, post } = seperator(/\*(.*?)\*/g, trimmedLine);
    const children = (
      <>
        <span>{parse(pre, options, index + 1, true)}</span>
        <em>
          {' '}
          {/* keep parsing for italic content */}
          {/* to be implemented */}
          {target}
        </em>
        <span>{parse(post, options, index + 1, true)}</span>
      </>
    );
    return inRecursion ? (
      <span key={`italic-${index}`} style={{ marginLeft }}>
        {children}
      </span>
    ) : (
      <div key={`italic-${index}`} style={{ marginLeft }}>
        {children}
      </div>
    );
  }

  // check for strike through
  if (/~~(.*?)~~/.test(trimmedLine)) {
    const { pre, target, post } = seperator(/~~(.*?)~~/g, trimmedLine);
    const children = (
      <>
        <span>{parse(pre, options, index + 1, true)}</span>
        <del>{target}</del>
        <span>{parse(post, options, index + 1, true)}</span>
      </>
    );
    return inRecursion ? (
      <span key={`strikethrough-${index}`} style={{ marginLeft }}>
        {children}
      </span>
    ) : (
      <div key={`strikethrough-${index}`} style={{ marginLeft }}>
        {children}
      </div>
    );
  }

  // check for links
  if (/\[([^\]]+)\]\(([^\)]+)\)/.test(trimmedLine)) {
    const { pre, target, post } = seperator(/\[([^\]]+)\]\(([^\)]+)\)/g, trimmedLine, 'a');
    const [linkName, href] = target.split(', ');
    const children = (
      <>
        <span>{parse(pre, options, index + 1, true)}</span>
        <span>
          <a
            href={href}
            key={`link-${index}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: 'cadetblue', textDecoration: 'underline' }}>
            {linkName}
          </a>
        </span>
        <span>{parse(post, options, index + 1, true)}</span>
      </>
    );
    return inRecursion ? (
      <span key={`link-${index}`} style={{ marginLeft }}>
        {children}
      </span>
    ) : (
      <div key={`link-${index}`} style={{ marginLeft }}>
        {children}
      </div>
    );
  }

  // check for line break
  if (!inRecursion && line === '') return <div className="h-[20px]"></div>;

  // finally, regular text
  return inRecursion ? (
    <span style={{ marginLeft }}>{trimmedLine}</span>
  ) : (
    <div style={{ marginLeft }}>{trimmedLine}</div>
  );
}

function seperator(pattern: RegExp, line: string, targetType: 'n' | 'a' = 'n') {
  const wrapper = line.match(pattern)![0];
  const wrapperIdx = line.indexOf(wrapper);
  const pre = line.slice(0, wrapperIdx);
  const post = line.slice(wrapperIdx + wrapper.length);
  let target = '';
  if (targetType === 'n') {
    target = wrapper.replace(pattern, '$1');
  }
  if (targetType === 'a') {
    target = wrapper.replace(pattern, '$1, $2');
  }
  return {
    pre,
    post,
    target,
  };
}

function CodeBlock({ lang, code }: { lang: string; code: string[] | null }) {
  const copyCode = async () => {
    if (code === null) return;
    try {
      await navigator.clipboard.writeText(code.join('\n'));
      alert('code copied!');
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };
  return (
    <div className="rounded-sm text-sm">
      <div className="flex justify-between items-center text-xs bg-gray-100 px-2 py-1 font-semibold text-gray-500">
        <span>{lang}</span>
        <button className="bg-gray-300 p-1 hover:bg-gray-200" onClick={copyCode}>
          copy
        </button>
      </div>
      {code === null ? null : (
        <SyntaxHighlighter style={oneDark} language={lang} customStyle={{ margin: '0' }}>
          {code.join('\n')}
        </SyntaxHighlighter>
      )}
    </div>
  );
}

function Table({ tableRows }: { tableRows: string[] }) {
  if (!tableRows.length) return null;

  const headerRow = tableRows[0]!;
  const headerColumns = headerRow
    .substring(1, headerRow.length - 1)
    .split('|')
    .map((column) => column.trim());
  const tableHead = (
    <thead>
      <tr>
        {headerColumns.map((column) => (
          <th className="px-2 py-1 border-l-2 border-b-2 border-zinc-200">{column}</th>
        ))}
      </tr>
    </thead>
  );
  if (tableRows.length <= 2)
    return (
      <table className="border-r-2 border-t-2 p-2 border-zinc-200 text-sm w-auto">
        {tableHead}
      </table>
    );

  const bodyRows = tableRows.slice(2)!;
  const tableBody = (
    <tbody>
      {bodyRows.map((row) => (
        <tr key={row}>
          {row
            .substring(1, row.length - 1)
            .split('|')
            .map((cell, cellIndex) => (
              <td
                key={`${row}-${cellIndex}`}
                className="px-2 py-1 border-l-2 border-b-2 border-zinc-200">
                {cell.trim()}
              </td>
            ))}
        </tr>
      ))}
    </tbody>
  );

  return (
    <table className="border-r-2 border-t-2 p-2 border-zinc-200 text-sm w-auto">
      {tableHead}
      {tableBody}
    </table>
  );
}

export default function handleMarkdown(value: string) {
  const cb = {
    inCodeBlock: false,
    codeBlockLang: null,
    code: [],
  };
  const tb = {
    inTable: false,
    tableRows: [],
  };
  return value.split('\n').map((chunk) => {
    const res = parse(chunk, {
      cb,
      tb,
    });

    if (typeof res === 'string' && res.startsWith('cb')) {
      const marginLeft = res.split(',')[1];
      return (
        <div style={{ marginLeft }}>
          <CodeBlock lang={cb.codeBlockLang!} code={cb.code} />
        </div>
      );
    }

    if (typeof res === 'string' && res.startsWith('tb')) {
      const marginLeft = res.split(',')[1];
      return (
        <div style={{ marginLeft }}>
          <Table tableRows={tb.tableRows} />
        </div>
      );
    }

    return res;
  });
}
