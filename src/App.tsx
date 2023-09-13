import { useEffect, useState } from 'react';
import handleMarkdown from './markdown-parser';

function App() {

  const [markdownContent, setMarkdownContent] = useState('')

  useEffect(() => {
    async function fetchMarkdownFile() {
      try {
        const response = await fetch('../assets/dummy-md.md');
        const markdownText = await response.text();
        setMarkdownContent(markdownText);
        // console.log(markdownText.split('\n'))
      } catch (error) {
        console.error('Error loading Markdown file:', error);
      }
    }

    fetchMarkdownFile();
  }, []);
  
  
  return (
    <div className='flex gap-4 my-2 mx-4'>
      <div className='text-sm w-25'>
        {markdownContent.split('\n').map((p, idx) => p === '' ? <br key={idx} /> : <p key={idx}>{p}</p>)}
      </div>
      <div>
        {handleMarkdown(markdownContent)}
      </div>
    </div>
  )
}

export default App
