import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Key:", apiKey);
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent("Hello!");
    const response = await result.response;
    console.log(response.text());
  } catch (error) {
    console.error("Error details:", error);
  }
}

test();
