const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdf = require('pdf-parse');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyBsYqbyfjbBxDHVY8NeiMi3Tz_fQJsqKQM');

exports.extractPdfText = async (req, res) => {
  try {
    console.log('PDF extract request received');
    console.log('File:', req.file ? 'Present' : 'Missing');
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PDF file uploaded' });
    }

    console.log('File size:', req.file.size);
    console.log('File mimetype:', req.file.mimetype);
    console.log('pdf module:', typeof pdf);

    const dataBuffer = req.file.buffer;
    const data = await pdf(dataBuffer);

    console.log('PDF parsed successfully, pages:', data.numpages);

    res.status(200).json({
      success: true,
      text: data.text,
      pages: data.numpages
    });
  } catch (error) {
    console.error('Error extracting PDF:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to extract PDF text',
      error: error.message 
    });
  }
};

exports.chatWithPdf = async (req, res) => {
  try {
    const { pdfText, question } = req.body;

    if (!pdfText || !question) {
      return res.status(400).json({ success: false, message: 'PDF text and question are required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Based on the following PDF content, answer the user's question accurately and concisely.

PDF Content:
${pdfText.substring(0, 30000)}

User Question: ${question}

Please provide a clear and helpful answer based only on the PDF content.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.status(200).json({
      success: true,
      answer: response
    });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ success: false, message: 'Failed to get response' });
  }
};
