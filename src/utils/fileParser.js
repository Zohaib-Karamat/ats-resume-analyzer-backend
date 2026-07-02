import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';
import { ApiError } from './ApiError.js';

export const extractTextFromFile = async (filePath, mimeType) => {
  try {
    if (mimeType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else {
      throw new ApiError(400, 'Unsupported file type for parsing');
    }
  } catch (error) {
    console.error('File extraction error:', error);
    throw new ApiError(500, 'Failed to extract text from file');
  }
};
