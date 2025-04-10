const groq = require('@groq/groq');
require('dotenv').config();

// Initialize the Groq client with the API key from .env
const groqClient = new groq.GroqClient({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Search for a command using Groq API
 * @param {string} query - Natural language query
 * @returns {Object} - Command and example
 */
async function searchCommand(query) {
  try {
    console.log('\n🚀 Using Groq API for query:', query);
    
    // Define the prompt for Groq
    const promptTemplate = `
    I need the exact command syntax and one example for this query: "${query}"
    
    Only return two lines in this exact format:
    COMMAND: <the command syntax>
    EXAMPLE: <one practical example>
    
    DO NOT include any explanations, descriptions, or additional information.
    ONLY return the COMMAND and EXAMPLE lines.
    The response must be concise, technical, and focused on the exact command.
    `;
    
    // Make the API call
    const chatCompletion = await groqClient.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: promptTemplate,
        },
      ],
      model: 'deepseek-r1-distill-llama-70b', // Using a fast model for quick responses
      temperature: 0.2, // Lower temperature for more deterministic responses
      max_tokens: 256, // Limit the response length
    });
    
    // Get the response text
    const text = chatCompletion.choices[0]?.message?.content.trim() || '';
    
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
    
    console.log('📋 GROQ RESULT:');
    console.log('  Command: ' + command);
    console.log('  Example: ' + example);
    console.log('----------------------------------\n');
    
    return { command, example };
  } catch (error) {
    console.error('⚠️ Error with Groq API:', error);
    throw new Error('Failed to fetch command from Groq API');
  }
}

module.exports = { searchCommand };
