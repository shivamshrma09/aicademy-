const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY is required in environment variables');
}
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

exports.extractPdfText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PDF file uploaded' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const pdfData = {
      inlineData: {
        data: req.file.buffer.toString('base64'),
        mimeType: 'application/pdf'
      }
    };

    const result = await model.generateContent([
      'Extract all text content from this PDF. Return only the text.',
      pdfData
    ]);
    
    const text = result.response.text();

    res.status(200).json({
      success: true,
      text: text,
      pages: 'N/A'
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
