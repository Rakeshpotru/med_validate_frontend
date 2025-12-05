import React, { useEffect, useState } from 'react';
import { jsonToHtml } from '../../hooks/JsontoHtml';
import axios from 'axios';

const CustomTinyMCEnew: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const baseURL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const res = await axios.get(`${baseURL}/document`);
        console.log(res.data);

        const html = jsonToHtml(res.data);
        setHtmlContent(html);
      } catch (error) {
        console.error('Error fetching document:', error);
      }
    };

    fetchDocument();
  }, [baseURL]);

  return (
    <div>
      <h2>Document Viewer</h2>
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
};

export default CustomTinyMCEnew;
