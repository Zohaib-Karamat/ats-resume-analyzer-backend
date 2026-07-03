import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
  .then(res => res.json())
  .then(data => {
    if (data.models) {
      const models = data.models.map(m => m.name);
      console.log("Available models:", models.filter(m => m.includes('gemini')));
    } else {
      console.error("Error response:", data);
    }
  })
  .catch(console.error);
