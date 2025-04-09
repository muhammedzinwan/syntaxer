const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize the Gemini API with the API key from .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Search for a command using Gemini API
 * @param {string} query - Natural language query
 * @returns {Object} - Command and example
 */
async function searchCommand(query) {
  try {
    console.log('\n🔍 QUERY: "' + query + '"');
    console.log('----------------------------------');
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Carefully crafted prompt to get exactly the format we need
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
    
    console.log('📋 RESULT:');
    console.log('  Command: ' + command);
    console.log('  Example: ' + example);
    console.log('----------------------------------\n');
    
    return { command, example };
  } catch (error) {
    console.error('Error with Gemini API:', error);
    throw new Error('Failed to fetch command from Gemini API');
  }
}

module.exports = { searchCommand };
