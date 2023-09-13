import { useEffect, useState } from 'react';
import handleMarkdown from './markdown-parser/markdown-parser';

function App() {
  const [markdownContent, setMarkdownContent] = useState('');
  const [contentToRender, setContentToRender] = useState('');

  useEffect(() => {
    async function fetchMarkdownFile() {
      try {
        const response = await fetch('../assets/dummy-md.md');
        const markdownText = await response.text();
        setMarkdownContent(markdownText);
      } catch (error) {
        console.error('Error loading Markdown file:', error);
      }
    }

    fetchMarkdownFile();
  }, []);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= markdownContent.length) {
        setContentToRender(markdownContent.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 20);

    return () => {
      clearInterval(interval);
    };
  }, [markdownContent]);

  return (
    <div className="flex gap-[20px] my-2 mx-4">
      <div className="w-[700px]">
        {markdownContent
          .split('\n')
          .map((p, idx) => (p === '' ? <br key={idx} /> : <p key={idx}>{p}</p>))}
      </div>
      <div className="w-[650px] text-lg text-[#3c4043] font-EBGaramond">
        {handleMarkdown(markdownContent)}
      </div>
    </div>
  );
}

export default App;
