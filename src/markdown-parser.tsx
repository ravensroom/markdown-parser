import React from 'react';

import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
// checkout highlight themes by Prism: https://github.com/PrismJS/prism-themes
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
// list of languages we want to support code highlighting
// checkout languaes supported by Prism: https://github.com/react-syntax-highlighter/react-syntax-highlighter/blob/master/AVAILABLE_LANGUAGES_PRISM.MD
import tsx from 'react-syntax-highlighter/dist/cjs/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript';
import scss from 'react-syntax-highlighter/dist/cjs/languages/prism/scss';
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash';
import markdown from 'react-syntax-highlighter/dist/cjs/languages/prism/markdown';
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json';

SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('scss', scss);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('json', json);

export interface ParseOptions {
  langPrefix?: string;
  cb: {
    inCodeBlock: boolean,
    codeBlockLang: string | null,
    codeBlock: string[]
  }
  tb: {
    inTable: boolean,
    tableRows: string[]
  }
}

export function parse(
  lineInput: string,
  options: ParseOptions,
  index = 0,

): React.ReactNode {

  const line: string = lineInput.trimEnd();
  const { cb, tb } = options;
  const precedingSpaces = line.match(/^(\s+)/)?.[1].length || 0; // Count preceding spaces
  const marginLeft = `${precedingSpaces * 10}px`;


  // block-level parsing - multi-line block: codeBlock, table

  // check for code block
  if (/^```(\S+)?/.test(line)) {
    cb.inCodeBlock = !cb.inCodeBlock;
    // code block starts, mark the language
    if (cb.inCodeBlock) {
      cb.codeBlockLang = line.match(/^```(\S+)?/)?.[1] || null;
      return null
    } 
    // code block ends, render the completed code
    const code = cb.codeBlock.join('\n');
    const lang = cb.codeBlockLang || ''
    cb.codeBlock = []
    cb.codeBlockLang = null

    const copyCode = async () => {
      try {
        await navigator.clipboard.writeText(code);
        alert('code copied!')
      } catch (error) {
        console.error('Failed to copy code:', error);
      }
    };

    return (
      <div className='rounded-sm text-sm'>
        <div className='flex justify-between items-center text-xs bg-gray-100 px-2 py-1 font-semibold text-gray-500'>
          <span>{lang}</span>
          <button className='bg-gray-300 p-1 hover:bg-gray-200' onClick={copyCode}>copy</button>
        </div>
        <SyntaxHighlighter style={oneDark} language={lang} customStyle={{ margin: '0'}}>{code}</SyntaxHighlighter>
      </div>
    );
  }

  if (cb.inCodeBlock) {
    cb.codeBlock.push(line);
    return null
  }

  // check for table
  if (/^\|(.+\|)+/.test(line)) {
    if (!tb.inTable) {
      tb.inTable = true
    }
    tb.tableRows.push(line)
    return null
  }

  // not matching table format, turn the flag off and start rendering
  if (tb.inTable) {
    tb.inTable = false

    const headerRow = tb.tableRows[0]!
    const bodyRows = tb.tableRows.slice(2)!
    tb.tableRows = []

    const headerColumns = headerRow
        .substring(1, headerRow.length - 1)
        .split("|")
        .map((column) => column.trim());
    const tableHead = (
        <thead>
          <tr>
            {headerColumns.map((column) => (
              <th className='px-2 py-1 border-l-2 border-b-2 border-zinc-200'>{column}</th>
            ))}
          </tr>
        </thead>
      );
    const tableBody = (
        <tbody>
          {bodyRows.map((row) => (
            <tr>
              {row
                .substring(1, row.length - 1)
                .split("|")
                .map((cell, cellIndex) => (
                  <td className='px-2 py-1 border-l-2 border-b-2 border-zinc-200'>{cell.trim()}</td>
                ))}
            </tr>
          ))}
        </tbody>
      );
    
    return (
      <table className='border-r-2 border-t-2 p-2 border-zinc-200 text-sm w-auto'>
        {tableHead}
        {tableBody}
      </table>
    )
  }


  // block-level parsing - one-line block: h, li, blockquote, hr, img

  // check for header
  if (/^#{1,6}\s/.test(line)) {
    const level = line.match(/^#{1,6}/)?.[0].length || 0;
    const text = line.replace(/^#{1,6}\s/, '');
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

  // check for unordered list
  if (/^(\*|-)\s/.test(line)) {
    const text = line.replace(/^(\*|-)\s/, '');
    return (
      <div
        style={{
          marginLeft,
          paddingLeft: '10px',
          position: 'relative',
        }}>
        <span
          style={{
            content: "'\\2022'",
            position: 'absolute',
            left: '0',
            top: '13px',
            border: '2px solid black',
            borderRadius: '50%',
          }}
        />{' '}
        {parse(text, options, index + 1)}
      </div>
    );
    // check for nested unordered list
  } else if (/^(\*|-)\s/.test(line.trimStart())) {
    const text = line.trimStart();
    return (
      <div
        style={{
          marginLeft,
          position: 'relative',
        }}>
        <span
          style={{
            content: "'\\2022'",
            position: 'absolute',
            left: '0',
            top: '13px',
            border: '2px solid black',
            borderRadius: '50%',
          }}
        />
        {parse(text, options, index + 1)}
      </div>
    );
  }

  // check for ordered list
  if (/^\d+\.\s/.test(line)) {
    const text = line.replace(/^\d+\.\s/, '');
    return (
      <li
        style={{
          listStyleType: 'disc',
          marginLeft,
          paddingLeft: '10px',
          position: 'relative',
        }}>
        {parse(text, options, index + 1)}
      </li>
    );
  }

  // check for blockquote
  if (/^>\s/.test(line)) {
    const text = line.replace(/^>\s?/, '');
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
  if (/!\[([^\]]+)\]\(([^\)]+)\)/.test(line)) {
    const match = line.match(/!\[([^\]]+)\]\(([^\)]+)\)/);
    const alt = match?.[1];
    const src = match?.[2];
    return <img src={src} alt={alt} />;
  }


  // span-level parsing - inside-one-line: bold, italic, strike-through, inline-code, link

  // check for inline code
  if (/`([^`]+)`/.test(line)) {
    const { pre, target, post } = seperator(/`([^`]+)`/g, line, 'code')
    return (
      <span key={`inlcd-${index}`}>
        <span>{parse(pre, options, index + 1)}{` `}</span>
        <span className='bg-gray-200 font-bold text-sm rounded-[4px] px-1'>{parse(target, options, index + 1)}</span>
        <span>{` `}{parse(post, options, index + 1)}</span>
      </span>
    )
  }

  // check for bold
  if (/\*\*(.*?)\*\*/.test(line)) {
    const {pre, target, post} = seperator(/\*\*(.*?)\*\*/g, line, 'n')

    return (
      <span>
        <span>{parse(pre, options, index + 1)}{` `}</span>
        <span key={`bold-${target.slice(0, 5)}`} style={{ fontWeight: '500' }}>
         {target}
        </span>
        <span>{` `}{parse(post, options, index + 1)}</span>
      </span>
    );
  }
  
  // check for italic
  if (/\*(.*?)\*/.test(line)) {
    const {pre, target, post} = seperator(/\*(.*?)\*/g, line, 'n')
    return (
      <span key={`italic-${index}`}>
        <span>{parse(pre, options, index + 1)}{` `}</span>
        <em>
          {target}
        </em>
        <span>{` `}{parse(post, options, index + 1)}</span>
      </span>
    );
  }

  // check for strike through
  if (/~~(.*?)~~/.test(line)) {
    const { pre, target, post } = seperator(/~~(.*?)~~/g, line, 'n');
    return (
      <span key={`strikethrough-${index}`}>
        <span>{parse(pre, options, index + 1)}{` `}</span>
        <del>{target}</del>
        <span>{` `}{parse(post, options, index + 1)}</span>
      </span>
    );
  }

  // check for links
  if (/\[([^\]]+)\]\(([^\)]+)\)/.test(line)) {
    const {pre, target, post} = seperator(/\[([^\]]+)\]\(([^\)]+)\)/g, line, 'a')
    
    return (
      <span key={`link-${index}`}>
        <span>{parse(pre, options, index + 1)}{` `}</span>
        <span>{parse(target, options, index + 1)}</span>
        <span>{` `}{parse(post, options, index + 1)}</span>
      </span>
    )
  }


  // helpers

  // check for <a> element
  if (line.trim().includes('<a ')) {
    const regex = /<a\s+href="([^"]+)">(.*?)<\/a>/;
    const match = line.match(regex);

    if (match) {
      const href = match[1];
      const content = match[2];
      return (
        <a
          href={href}
          key={`link-${index}`}
          target="_blank"
          rel="noreferrer"
          style={{ marginLeft, color: 'blue', textDecoration: 'underline' }}>
          {content}
        </a>
      );
    }
  }

  // check for <code> elements
  if (line.trim().includes('<code>')) {
    const regex = /<code>(.*?)<\/code>/;
    const content = line.replace(regex, '$1');
    if (content) {
      return (
        <code key={`code-${index}`}>
          {content}
        </code>
      );
    }
  }

  // check for line break
  if (line === '') return <div className='h-[6px]'></div>

  // finally, regular text
  return <span>{line}</span>;
}

function seperator(pattern: RegExp, line: string, targetType: 'n' | 'a' | 'code') {
    const wrapper = line.match(pattern)![0]
    const wrapperIdx = line.indexOf(wrapper)
    const pre = line.slice(0, wrapperIdx)
    const post = line.slice(wrapperIdx + wrapper.length)
    let target = ''
    if (targetType === 'n') {
      target = wrapper.replace(pattern, '$1')
    }
    if (targetType === 'a') {
      target = wrapper.replace(pattern, '<a href="$2">$1</a>');
    }
    if (targetType === 'code') {
      target = wrapper.replace(pattern, '<code>$1</code>');
    }
    return {
      pre, post, target
    }
}

export default function handleMarkdown(value: string) {
  const cb = {
    inCodeBlock: false,
    codeBlockLang: null,
    codeBlock: []
  }
  const tb = {
    inTable: false,
    tableRows: []
  }
  return value.split('\n').map((chunk) => parse(chunk, {
    cb, tb
  }));
}