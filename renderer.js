document.addEventListener('DOMContentLoaded', () => {
  // Focus the search input when the window is shown
  setTimeout(() => {
    document.getElementById('search-input').focus();
  }, 100);
  const searchInput = document.getElementById('search-input');
  const commandResult = document.getElementById('command-result');
  const commandText = document.getElementById('command-text');
  const exampleText = document.getElementById('example-text');
  const loading = document.getElementById('loading');
  const errorText = document.getElementById('error-text');
  const copyCommandBtn = document.getElementById('copy-command');
  const copyExampleBtn = document.getElementById('copy-example');
  const container = document.querySelector('.container'); // Still useful for structure if needed later

  let dismissTimeout;

  // Listen for clear-contents event
  window.api.onClearContents(() => {
    clearContents();
  });
  
  // Search on enter key
  searchInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        await searchCommand(query);
      }
    } else if (e.key === 'Escape') {
      window.api.close();
    }
  });
  
  // Copy command to clipboard
  copyCommandBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(commandText.textContent);
    showCopiedFeedback(copyCommandBtn);
  });
  
  // Copy example to clipboard
  copyExampleBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(exampleText.textContent);
    showCopiedFeedback(copyExampleBtn);
  });
  
  // Search for a command using the API
  async function searchCommand(query) {
    // Reset state
    // Reset state & prepare for loading
    clearContents(); // Clear previous results
    loading.classList.remove('hidden');

    try {
      const result = await window.api.searchCommand(query);
      
      if (result.error) {
        showError(result.error);
        return;
      }
      
      // Update UI with results
      commandText.textContent = result.command;
      exampleText.textContent = result.example;
      
      // Show results
      loading.classList.add('hidden');
      commandResult.classList.remove('hidden');
      
      // Allow a moment for the animation to start, then trigger reflow
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);


      // Auto-dismiss after 15 seconds
      dismissTimeout = setTimeout(() => {
        window.api.close();
      }, 15000);
    } catch (error) {
      showError('Failed to search. Please try again.');
    }
  }
  
  // Show error message
  // Show error message
  function showError(message) {
    // Ensure loading is hidden and error is shown before calculating height
    loading.classList.add('hidden');
    commandResult.classList.add('hidden'); // Hide results if any
    errorText.textContent = message;
    errorText.classList.remove('hidden');

  }

  // Show feedback when copying to clipboard
  function showCopiedFeedback(button) {
    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    setTimeout(() => {
      button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
    }, 1500);
  }
  
  // Clear all contents
  function clearContents() {
    searchInput.value = '';
    commandResult.classList.add('hidden');
    loading.classList.add('hidden');
    errorText.classList.add('hidden');
    commandText.textContent = '';
    exampleText.textContent = '';
    clearTimeout(dismissTimeout);
  }

  // Removed setBodyHeight function as it's no longer needed
});
