document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const promptText = document.getElementById('prompt-text');
    const cursor = document.getElementById('cursor');
    const journalForm = document.getElementById('journal-form');
    const journalEntry = document.getElementById('journal-entry');
    const submitButton = document.getElementById('submit-entry');
    const aiResponseContainer = document.getElementById('ai-response-container');
    const aiResponse = document.getElementById('ai-response');
    const newEntryButton = document.getElementById('new-entry');
    
    // Typewriter effect
    const text = "How did your day go?";
    let charIndex = 0;
    
    function typeWriter() {
        if (charIndex < text.length) {
            promptText.textContent += text.charAt(charIndex);
            charIndex++;
            setTimeout(typeWriter, 100);
        } else {
            // Show the journal form once typing is complete
            setTimeout(() => {
                journalForm.style.display = 'flex';
                journalEntry.focus();
            }, 500);
        }
    }
    
    // Start with empty prompt and hidden form
    promptText.textContent = '';
    journalForm.style.display = 'none';
    
    // Start typewriter effect after a short delay
    setTimeout(typeWriter, 1000);
    
    // Form submission
    submitButton.addEventListener('click', async function() {
        const entryText = journalEntry.value.trim();
        
        if (!entryText) {
            alert('Please write something about your day.');
            return;
        }
        
        // Disable the button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';
        
        try {
            // Send the journal entry to the backend
            const response = await fetch('/process_entry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ entry: entryText })
            });
            
            if (!response.ok) {
                throw new Error('Failed to process your entry');
            }
            
            const data = await response.json();
            
            // Hide the form and show the AI response
            journalForm.style.display = 'none';
            promptText.textContent = '';
            cursor.style.display = 'none';
            
            // Display AI response with typewriter effect
            aiResponse.textContent = '';
            aiResponseContainer.classList.remove('hidden');
            
            let responseIndex = 0;
            function typeResponse() {
                if (responseIndex < data.response.length) {
                    aiResponse.textContent += data.response.charAt(responseIndex);
                    responseIndex++;
                    setTimeout(typeResponse, 10);
                    // Scroll to the bottom of the response as it's typing
                    aiResponse.scrollTop = aiResponse.scrollHeight;
                }
            }
            
            typeResponse();
            
            // Make the response container visible after a short delay
            setTimeout(() => {
                aiResponseContainer.classList.add('visible');
            }, 300);
            
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = 'Submit';
        }
    });
    
    // New entry button
    newEntryButton.addEventListener('click', function() {
        // Reset the UI for a new entry
        aiResponseContainer.classList.remove('visible');
        setTimeout(() => {
            aiResponseContainer.classList.add('hidden');
            journalEntry.value = '';
            promptText.textContent = '';
            charIndex = 0;
            cursor.style.display = 'inline-block';
            typeWriter();
        }, 500);
    });
});