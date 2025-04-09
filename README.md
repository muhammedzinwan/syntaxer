# Syntaxer

A lightweight floating command search tool that helps you quickly find command syntax using natural language queries.

## Features

- Minimal floating search bar that appears with a keyboard shortcut (Alt+Space)
- Natural language queries to find command syntax (e.g., "How to merge branches in git")
- Uses Gemini API to fetch the exact command syntax and one example
- Clean, distraction-free interface
- System tray integration
- Dark/light theme support

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up your Gemini API key in the `.env` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. Create the icon file for the system tray:
   ```
   npm run create-icon
   ```
   This will create a simple blue square icon. You can also use your own PNG image named `icon.png` if preferred.

4. Start the application:
   ```
   npm start
   ```

## Usage

1. Press `Alt+Space` to open the search bar
2. Type your natural language query (e.g., "How to merge branches in git")
3. Press `Enter` to search
4. View the command syntax and example
5. Click the "Copy" button to copy the command to clipboard
6. Press `Escape` or click outside the window to dismiss

## Technologies Used

- Electron
- Google Gemini API
- HTML/CSS/JavaScript
