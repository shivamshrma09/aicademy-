import React, { useState, useRef } from 'react';
import { Upload, Send, FileText, X, Loader } from 'lucide-react';
import './PdfChat.css';

const API_URL = import.meta.env.VITE_API_URL;

const PdfChat = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfText, setPdfText] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const extractTextFromPDF = async (file) => {
    setExtracting(true);
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/pdf-chat/extract`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      console.log('Extract response:', data);
      
      if (data.success) {
        setPdfText(data.text);
        setMessages([{
          type: 'system',
          text: `PDF loaded successfully! (${data.pages} pages). You can now ask questions about the content.`
        }]);
      } else {
        alert(`Failed to extract PDF text: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error extracting PDF:', error);
      alert(`Failed to extract PDF text: ${error.message}`);
    } finally {
      setExtracting(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      extractTextFromPDF(file);
    } else {
      alert('Please upload a valid PDF file');
    }
  };

  const handleRemovePdf = () => {
    setPdfFile(null);
    setPdfText('');
    setMessages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !pdfText) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/pdf-chat/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pdfText,
          question: userMessage
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, { type: 'ai', text: data.answer }]);
        scrollToBottom();
      } else {
        setMessages(prev => [...prev, { 
          type: 'error', 
          text: 'Failed to get response. Please try again.' 
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        type: 'error', 
        text: 'Failed to get response. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="pdf-chat-container">
      <div className="pdf-chat-header">
        <h1 className="pdf-chat-title">PDF Chat Assistant</h1>
        <p className="pdf-chat-subtitle">Upload a PDF and ask questions about its content</p>
      </div>

      {!pdfFile ? (
        <div className="pdf-upload-section">
          <div className="upload-box" onClick={() => fileInputRef.current?.click()}>
            <Upload size={48} color="#174C7C" />
            <h3>Upload PDF Document</h3>
            <p>Click to browse or drag and drop your PDF file here</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      ) : (
        <div className="pdf-chat-main">
          <div className="pdf-info-bar">
            <div className="pdf-info">
              <FileText size={20} color="#174C7C" />
              <span>{pdfFile.name}</span>
            </div>
            <button className="remove-pdf-btn" onClick={handleRemovePdf}>
              <X size={18} />
              Remove PDF
            </button>
          </div>

          {extracting ? (
            <div className="extracting-loader">
              <Loader className="spinner" size={40} color="#174C7C" />
              <p>Extracting PDF content...</p>
            </div>
          ) : (
            <>
              <div className="messages-container">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`message message-${msg.type}`}>
                    <div className="message-content">
                      {msg.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="message message-ai">
                    <div className="message-content">
                      <Loader className="spinner" size={20} />
                      Thinking...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="input-container">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a question about the PDF..."
                  disabled={loading || extracting}
                  className="message-input"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={loading || extracting || !inputMessage.trim()}
                  className="send-button"
                >
                  <Send size={20} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PdfChat;
