import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';
import { ApiError } from './ApiError.js';

/**
 * Extract plain text from a file.
 * Accepts either a local file path (string) OR an in-memory Buffer.
 *
 * @param {Buffer|string} source  - Raw Buffer from multer memoryStorage, or a local file path
 * @param {string}        mimeType - MIME type of the file
 * @returns {Promise<string>}     - Extracted text content
 */
export const extractTextFromFile = async (source, mimeType) => {
  try {
    if (mimeType === 'application/pdf') {
      // pdf-parse accepts both Buffer and file path
      const data = await pdfParse(source);
      return data.text;
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      // mammoth accepts { buffer } or { path }
      const input = Buffer.isBuffer(source) ? { buffer: source } : { path: source };
      const result = await mammoth.extractRawText(input);
      return result.value;
    } else {
      throw new ApiError(400, 'Unsupported file type for parsing');
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('File extraction error:', error);
    throw new ApiError(500, 'Failed to extract text from file');
  }
};
