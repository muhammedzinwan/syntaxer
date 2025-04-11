const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const axios = require('axios');

// Initialize the Gemini API with the API key from .env (as fallback)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Search for a command using Groq API (with Gemini as fallback)
 * @param {string} query - Natural language query
 * @returns {Object} - Command and example
 */
async function searchCommand(query) {
  // Check if any API keys are configured
  if (!process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY) {
    return {
      error: 'No API keys configured. Please add your GROQ_API_KEY or GEMINI_API_KEY to the .env file.'
    };
  }
  
  // Check if the keys are still the placeholders
  if (process.env.GROQ_API_KEY === 'your_groq_api_key_here' && 
      process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return {
      error: 'API keys not set. Please update the .env file with your actual API keys.'
    };
  }
  
  // Try with Groq first, fall back to Gemini if it fails
  try {
    return await searchWithGroq(query);
  } catch (error) {
    console.log('Groq API failed, falling back to Gemini...', error.message);
    return await searchWithGemini(query);
  }
}

/**
 * Search for a command using Groq API
 * @param {string} query - Natural language query
 * @returns {Object} - Command and example
 */
async function searchWithGroq(query) {
  // Check if Groq API key is set
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not found in environment variables');
  }
  
  // Check if using placeholder key
  if (process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
    throw new Error('Please replace the placeholder GROQ_API_KEY in .env with your actual key');
  }

  console.log('\\n🔍 QUERY (Groq): "' + query + '"');
  console.log('----------------------------------');
  
  const promptTemplate = `
  I need the exact command syntax and one example for this query: "${query}"
  
  Only return two lines in this exact format:
  COMMAND: <the command syntax>
  EXAMPLE: <one practical example>
  
  DO NOT include any explanations, descriptions, or additional information.
  ONLY return the COMMAND and EXAMPLE lines.
  The response must be concise, technical, and focused on the exact command.
  `;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-70b-8192',  // Use Llama 3 70B model for best results
        messages: [
          { role: 'system', content: 'You are a command-line expert that provides concise command syntax and one example without any additional text.' },
          { role: 'user', content: promptTemplate }
        ],
        temperature: 0.1,  // Keep temperature low for consistent, precise responses
        max_tokens: 300
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const text = response.data.choices[0].message.content.trim();
    return parseResponse(text, 'Groq');
  } catch (error) {
    console.error('Error with Groq API:', error.message);
    throw error;
  }
}

/**
 * Search for a command using Gemini API (fallback)
 * @param {string} query - Natural language query
 * @returns {Object} - Command and example
 */
async function searchWithGemini(query) {
  // Check if Gemini API key is valid
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not found in environment variables');
  }
  
  // Check if using placeholder key
  if (process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new Error('Please replace the placeholder GEMINI_API_KEY in .env with your actual key');
  }
  
  console.log('\\n🔍 QUERY (Gemini): "' + query + '"');
  console.log('----------------------------------');
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Same prompt template for consistency
    const promptTemplate = `
    I need the exact command syntax and one example for this query: "${query}"
    
    Only return two lines in this exact format:
    COMMAND: <the command syntax>
    EXAMPLE: <one practical example>
    
    DO NOT include any explanations, descriptions, or additional information.
    ONLY return the COMMAND and EXAMPLE lines.
    The response must be concise, technical, and focused on the exact command.
    `;
    
    const result = await model.generateContent(promptTemplate);
    const text = result.response.text();
    
    return parseResponse(text, 'Gemini');
  } catch (error) {
    console.error('Error with Gemini API:', error);
    throw new Error('Failed to fetch command from Gemini API');
  }
}

/**
 * Parse LLM response to extract command and example
 * @param {string} text - Response from LLM
 * @param {string} source - Source of the response (Groq or Gemini)
 * @returns {Object} - Command and example
 */
function parseResponse(text, source) {
  // Parse the response to extract command and example
  const lines = text.trim().split('\n');
  let command = '', example = '';
  
  for (const line of lines) {
    if (line.startsWith('COMMAND:')) {
      command = line.replace('COMMAND:', '').trim();
    } else if (line.startsWith('EXAMPLE:')) {
      example = line.replace('EXAMPLE:', '').trim();
    }
  }
  
  // If we couldn't parse the response properly, provide fallback
  if (!command && !example) {
    // Try a simpler parsing approach
    if (lines.length >= 2) {
      command = lines[0].includes('COMMAND') ? lines[0].replace('COMMAND:', '').trim() : lines[0];
      example = lines[1].includes('EXAMPLE') ? lines[1].replace('EXAMPLE:', '').trim() : lines[1];
    }
  }
  
  console.log('📋 RESULT (' + source + '):');
  console.log('  Command: ' + command);
  console.log('  Example: ' + example);
  console.log('----------------------------------\\n');
  
  return { command, example, source };
}

module.exports = { searchCommand };
