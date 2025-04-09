# Syntaxer

<p align="center">
  <img src="icon.png" alt="Syntaxer Logo" width="100" height="100">
</p>

<p align="center">
  <b>A lightweight floating command search tool for developers</b>
</p>

<p align="center">
  Developed by <b>Muhammed Zinwan</b> github.com/muhammedzinwan
</p>

## About

Syntaxer is a minimalist, distraction-free tool that helps developers quickly find command syntaxes without having to Google or switch tabs. It stays out of your way until you need it, appearing instantly with a simple keyboard shortcut.

With Syntaxer, you can:
- Type natural language queries (e.g., "How to merge branches in git")
- Get immediate, concise results showing exactly the command you need
- Copy with a single click and get back to coding

No more context switching, no more digging through documentation - just the commands you need, when you need them.

## Features

- 🔍 **Instant Access**: Global shortcut (Alt+Space) to summon the search bar
- 💬 **Natural Language**: Ask in plain English how to do something
- 🧠 **AI-Powered**: Uses Groq for fast api response and Google's Gemini API for intelligent responses
- ⚡ **Minimal UI**: Distraction-free interface with dark/light theme support
- 📋 **Quick Copy**: One-click copying of commands and examples
- 🔄 **System Integration**: System tray icon for easy access

## Setup Instructions

1. **Clone the repository**
   ```
   git clone https://github.com/muhammedzinwan/syntaxer.git
   cd syntaxer
   ```

2. **Install dependencies**
   ```
   npm install
   ```
3. **Set up your Groq API key**  
   Create or edit the `.env` file in the root directory:
   ```
   GROQ_API_KEY=your_api_key_here
   ```
   You can get a free API key from [Groq cloud](https://console.groq.com/keys)

3. **Set up your Gemini API key**  
   Create or edit the `.env` file in the root directory:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
   You can get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

4. **Install fonts (optional but recommended)**

   Fonts are Included within the project files. Just make sure you have them in the font folder. 

5. **Start the application**
   ```
   npm start
   ```

## Usage

1. **Press `Alt+Space`** to summon the search bar from anywhere

2. **Type your query** in natural language
   - "merge branches in git"
   - "list all docker containers"
   - "Python regex match pattern"

3. **Press Enter** to search

4. View the results:
   - **Command**: The exact syntax you need
   - **Example**: A practical usage example

5. **Click the copy button** next to either result to copy to clipboard

6. **Press Escape** to dismiss the window

## Technologies Used

- Electron
- Groq Cloud API
- Google Gemini API
- JetBrains Mono Font

## License

MIT License

## Contributing

Contributions are welcome! Feel free to submit a Pull Request.

## Acknowledgments
- Thanks to Groq for their lightning speed groq API
- Thanks to Google for the Gemini API
- JetBrains for the beautiful monospace font

---

<p align="center">
  Made with ❤️ by Muhammed Zinwan
</p>
