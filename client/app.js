/**
 * AI Design Assistant - Main Application
 */

(function() {
    'use strict';

    // Initialize CSInterface
    const csInterface = new CSInterface();
    
    // API Configuration - Using image model for everything
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';
    const GEMINI_STREAM_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:streamGenerateContent';
    
    // State
    let apiKey = localStorage.getItem('gemini_api_key') || '';
    let conversationHistory = [];
    let currentArtboardImage = null;

    // DOM Elements
    const elements = {
        chatContainer: document.getElementById('chatContainer'),
        userInput: document.getElementById('userInput'),
        sendBtn: document.getElementById('sendBtn'),
        attachBtn: document.getElementById('attachBtn'),
        quickBtns: document.querySelectorAll('.quick-btn'),
        newChatBtn: document.getElementById('newChatBtn'),
        settingsBtn: document.getElementById('settingsBtn'),
        settingsModal: document.getElementById('settingsModal'),
        apiKeyInput: document.getElementById('apiKeyInput'),
        apiStatus: document.getElementById('apiStatus'),
        saveSettingsBtn: document.getElementById('saveSettingsBtn'),
        cancelSettingsBtn: document.getElementById('cancelSettingsBtn'),
        closeSettingsBtn: document.getElementById('closeSettingsBtn')
    };

    // Initialize
    function init() {
        setupEventListeners();
        loadApiKey();
        autoResizeTextarea();
    }

    // Setup event listeners
    function setupEventListeners() {
        elements.sendBtn.addEventListener('click', sendMessage);
        elements.attachBtn.addEventListener('click', captureArtboard);
        elements.userInput.addEventListener('keydown', handleTextareaKeydown);
        elements.userInput.addEventListener('input', autoResizeTextarea);
        elements.newChatBtn.addEventListener('click', newChat);
        elements.settingsBtn.addEventListener('click', openSettings);
        elements.saveSettingsBtn.addEventListener('click', saveApiKey);
        elements.cancelSettingsBtn.addEventListener('click', closeSettings);
        elements.closeSettingsBtn.addEventListener('click', closeSettings);

        elements.quickBtns.forEach(btn => {
            btn.addEventListener('click', () => handleQuickAction(btn.dataset.action));
        });

        // Close modal on background click
        elements.settingsModal.addEventListener('click', (e) => {
            if (e.target === elements.settingsModal) {
                closeSettings();
            }
        });
    }

    // Load API key from storage
    function loadApiKey() {
        if (apiKey) {
            elements.apiKeyInput.value = apiKey;
            updateApiStatus('Configured', true);
        }
    }

    // Open settings modal
    function openSettings() {
        elements.settingsModal.classList.add('active');
    }

    // Close settings modal
    function closeSettings() {
        elements.settingsModal.classList.remove('active');
    }

    // New chat
    function newChat() {
        conversationHistory = [];
        elements.chatContainer.innerHTML = '';
        currentArtboardImage = null;
    }

    // Save API key
    function saveApiKey() {
        const key = elements.apiKeyInput.value.trim();
        if (!key) {
            showError('Please enter an API key');
            return;
        }

        apiKey = key;
        localStorage.setItem('gemini_api_key', key);
        updateApiStatus('Saved successfully!', true);
        
        setTimeout(() => {
            updateApiStatus('Configured', true);
            closeSettings();
        }, 1500);
    }

    // Update API status
    function updateApiStatus(message, success = false) {
        elements.apiStatus.textContent = message;
        if (success) {
            elements.apiStatus.classList.add('success');
        } else {
            elements.apiStatus.classList.remove('success');
        }
    }

    // Auto-resize textarea
    function autoResizeTextarea() {
        const textarea = elements.userInput;
        textarea.style.height = '44px';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    // Handle textarea keydown
    function handleTextareaKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    // Send message with streaming
    async function sendMessage() {
        const message = elements.userInput.value.trim();
        if (!message) return;

        if (!apiKey) {
            showError('Please configure your API key first');
            return;
        }

        // Add user message to chat
        addMessage(message, 'user');
        elements.userInput.value = '';
        autoResizeTextarea();

        // Disable input while processing
        setInputState(false);

        try {
            // Call streaming API
            await callGeminiStreamAPI(message, currentArtboardImage);
        } catch (error) {
            showError('Error: ' + error.message);
        } finally {
            setInputState(true);
            currentArtboardImage = null; // Clear attached image
        }
    }

    // Call Gemini API with streaming
    async function callGeminiStreamAPI(message, imageData = null) {
        const parts = [{ text: message }];
        
        // Add image if attached
        if (imageData) {
            parts.push({
                inlineData: {
                    mimeType: 'image/png',
                    data: imageData
                }
            });
        }

        const requestBody = {
            contents: [{
                parts: parts
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
                responseModalities: ['Text', 'Image']
            }
        };

        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API request failed');
        }

        const result = await response.json();
        
        if (result.candidates && result.candidates[0]) {
            const content = result.candidates[0].content;
            let fullText = '';
            
            for (const part of content.parts) {
                // Handle text
                if (part.text) {
                    fullText += part.text;
                    addMessage(fullText, 'assistant');
                }
                
                // Handle images
                if (part.inlineData) {
                    const imageData = part.inlineData.data;
                    addImageToChat(imageData);
                    
                    // Automatically place on artboard
                    placeImageOnArtboard(imageData);
                }
            }

            // Update conversation history
            if (fullText) {
                conversationHistory.push({
                    role: 'user',
                    parts: [{ text: message }]
                });
                conversationHistory.push({
                    role: 'model',
                    parts: [{ text: fullText }]
                });
            }
        }
    }

    // Call Gemini API
    async function callGeminiAPI(message, imageData = null) {
        const parts = [];
        
        // Add text
        parts.push({ text: message });
        
        // Add image if attached
        if (imageData) {
            parts.push({
                inlineData: {
                    mimeType: 'image/png',
                    data: imageData
                }
            });
        }

        const requestBody = {
            contents: [{
                parts: parts
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        };

        // Add conversation history for context
        if (conversationHistory.length > 0) {
            requestBody.contents = [
                ...conversationHistory.slice(-4), // Keep last 4 messages for context
                ...requestBody.contents
            ];
        }

        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API request failed');
        }

        return await response.json();
    }

    // Call Gemini Image Generation API
    async function callGeminiImageAPI(prompt) {
        const requestBody = {
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                responseModalities: ['Image']
            }
        };

        const response = await fetch(`${GEMINI_IMAGE_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Image generation failed');
        }

        return await response.json();
    }

    // Capture artboard screenshot
    function captureArtboard() {
        if (!apiKey) {
            showError('Please configure your API key first');
            return;
        }

        addMessage('<span class="spectrum-icon"><svg viewBox="0 0 24 24"><path d="M9.4 10.5l4.77-8.26C13.47 2.09 12.75 2 12 2c-2.4 0-4.6.85-6.32 2.25l3.66 6.35.06-.1zM21.54 9c-.92-2.92-3.15-5.26-6-6.34L11.88 9h9.66zm.26 1h-7.49l.29.5 4.76 8.25C21 16.97 22 14.61 22 12c0-.69-.07-1.35-.2-2zM8.54 12l-3.9-6.75C3.01 7.03 2 9.39 2 12c0 .69.07 1.35.2 2h7.49l-1.15-2zm-6.08 3c.92 2.92 3.15 5.26 6 6.34L12.12 15H2.46zm11.27 0l-3.9 6.76c.7.15 1.42.24 2.17.24 2.4 0 4.6-.85 6.32-2.25l-3.66-6.35-.93 1.6z"/></svg></span> Capturing artboard...', 'system');

        csInterface.evalScript('captureArtboard()', (result) => {
            try {
                const data = JSON.parse(result);
                if (data.success) {
                    currentArtboardImage = data.imageData;
                    addMessage('<span class="spectrum-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></span> Artboard captured! Ready to analyze.', 'system success');
                } else {
                    showError('Failed to capture artboard: ' + (data.error || 'Unknown error'));
                }
            } catch (error) {
                showError('Error capturing artboard: ' + error.message);
            }
        });
    }

    // Capture selected items
    function captureSelection() {
        if (!apiKey) {
            showError('Please configure your API key first');
            return;
        }

        addMessage('<span class="spectrum-icon"><svg viewBox="0 0 24 24"><path d="M3 5h2V3c-1.1 0-2 .9-2 2zm0 8h2v-2H3v2zm4 8h2v-2H7v2zM3 9h2V7H3v2zm10-6h-2v2h2V3zm6 0v2h2c0-1.1-.9-2-2-2zM5 21v-2H3c0 1.1.9 2 2 2zm-2-4h2v-2H3v2zM9 3H7v2h2V3zm2 18h2v-2h-2v2zm8-8h2v-2h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2zm0-12h2V7h-2v2zm0 8h2v-2h-2v2zm-4 4h2v-2h-2v2zm0-16h2V3h-2v2z"/></svg></span> Capturing selection...', 'system');

        csInterface.evalScript('captureSelection()', (result) => {
            try {
                const data = JSON.parse(result);
                if (data.success) {
                    currentArtboardImage = data.imageData;
                    addMessage('<span class="spectrum-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></span> Selection captured! Ready to analyze.', 'system success');
                } else {
                    if (data.error && data.error.includes('No items selected')) {
                        showError('Please select something on the artboard first.');
                    } else {
                        showError('Failed to capture selection: ' + (data.error || 'Unknown error'));
                    }
                }
            } catch (error) {
                showError('Error capturing selection: ' + error.message);
            }
        });
    }

    // Handle quick actions
    async function handleQuickAction(action) {
        if (!apiKey) {
            showError('Please configure your API key first');
            return;
        }

        let prompt = '';

        switch (action) {
            case 'analyze':
                captureArtboard();
                setTimeout(() => {
                    if (currentArtboardImage) {
                        prompt = 'Analyze this design and provide detailed feedback on composition, color usage, typography, and overall visual impact.';
                        elements.userInput.value = prompt;
                        sendMessage();
                    }
                }, 1000);
                break;

            case 'analyze-selection':
                captureSelection();
                setTimeout(() => {
                    if (currentArtboardImage) {
                        prompt = 'Analyze this specific selection. What is it, and how can I improve it?';
                        elements.userInput.value = prompt;
                        sendMessage();
                    }
                }, 1000);
                break;

            case 'generate':
                prompt = 'Generate a modern, minimalist logo design';
                elements.userInput.value = prompt;
                elements.userInput.focus();
                break;

            case 'colors':
                captureArtboard();
                setTimeout(() => {
                    if (currentArtboardImage) {
                        prompt = 'Extract the color palette from this design and suggest complementary colors that would work well with it.';
                        elements.userInput.value = prompt;
                        sendMessage();
                    }
                }, 1000);
                break;

            case 'improve':
                captureArtboard();
                setTimeout(() => {
                    if (currentArtboardImage) {
                        prompt = 'Provide specific, actionable suggestions to improve this design. Focus on practical tips I can implement immediately.';
                        elements.userInput.value = prompt;
                        sendMessage();
                    }
                }, 1000);
                break;
        }
    }

    // Add message to chat
    function addMessage(text, type = 'assistant') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        // Format text with basic markdown support
        const formattedText = formatMessage(text);
        messageDiv.innerHTML = formattedText;
        
        elements.chatContainer.appendChild(messageDiv);
        elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
    }

    // Add image to chat
    function addImageToChat(base64Data) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant';
        
        const img = document.createElement('img');
        img.src = `data:image/png;base64,${base64Data}`;
        img.alt = 'Generated image';
        
        messageDiv.appendChild(img);
        elements.chatContainer.appendChild(messageDiv);
        elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
    }

    // Add button to place image on artboard
    function addPlaceImageButton(base64Data) {
        const buttonDiv = document.createElement('div');
        buttonDiv.className = 'message system';
        buttonDiv.style.cursor = 'pointer';
        buttonDiv.innerHTML = '📥 <strong>Place on Artboard</strong> (Click to add image to Illustrator)';
        
        buttonDiv.addEventListener('click', () => {
            placeImageOnArtboard(base64Data);
        });
        
        elements.chatContainer.appendChild(buttonDiv);
        elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
    }

    // Place image on artboard using CEP file system API
    function placeImageOnArtboard(base64Data) {
        addMessage('<span class="spectrum-icon"><svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg></span> Placing image on artboard...', 'system');
        
        // Get userData directory path
        let userDataPath = csInterface.getSystemPath('userData');
        
        // Remove file:// prefix if present
        if (userDataPath.startsWith('file://')) {
            userDataPath = userDataPath.substring(7);
        }
        
        // On Windows, remove leading slash if it exists before drive letter (e.g. /C:/...)
        if (navigator.platform.indexOf('Win') > -1 && userDataPath.startsWith('/') && userDataPath[2] === ':') {
            userDataPath = userDataPath.substring(1);
        }
        
        const fileName = 'ai_gen_' + Date.now() + '.png';
        
        // Construct path with correct separators for the OS
        const isWindows = navigator.platform.indexOf('Win') > -1;
        const separator = isWindows ? '\\' : '/';
        
        // Normalize userDataPath separators
        if (isWindows) {
            userDataPath = userDataPath.replace(/\//g, '\\');
        }
        
        const filePath = userDataPath + separator + fileName;
        
        console.log('Attempting to save image to:', filePath);

        // Write file using CEP fs API
        const writeResult = window.cep.fs.writeFile(filePath, base64Data, window.cep.encoding.Base64);
        
        if (writeResult.err !== 0) {
            console.error('Write failed:', writeResult);
            showError('Failed to save image file (Error ' + writeResult.err + ') at: ' + filePath);
            return;
        }
        
        console.log('Image saved successfully. Calling Illustrator...');

        // Now place the file in Illustrator
        // Pass the path exactly as is, ExtendScript handles it
        // But we need to escape backslashes for the string literal in evalScript
        const scriptPath = isWindows ? filePath.replace(/\\/g, '\\\\') : filePath;
        
        csInterface.evalScript(`placeImageFromFile("${scriptPath}")`, (result) => {
            console.log('Illustrator response:', result);
            try {
                const data = JSON.parse(result);
                if (data.success) {
                    addMessage('<span class="spectrum-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></span> Image placed on artboard!', 'system success');
                } else {
                    console.error('Placement failed:', data.error);
                    showError('Placement failed: ' + data.error);
                }
            } catch (error) {
                console.error('Error parsing response:', error);
                showError('Error: ' + error.message);
            }
        });
    }

    // Show error message
    function showError(message) {
        addMessage(message, 'error');
    }

    // Format message with basic markdown
    function formatMessage(text) {
        // Code blocks
        text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
        
        // Bold
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Line breaks
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }

    // Set input state
    function setInputState(enabled) {
        elements.sendBtn.disabled = !enabled;
        elements.userInput.disabled = !enabled;
        elements.attachBtn.disabled = !enabled;
        
        if (enabled) {
            elements.sendBtn.textContent = 'Send';
            elements.userInput.focus();
        } else {
            elements.sendBtn.innerHTML = '<span class="spectrum-loader"></span>';
        }
    }

    // Initialize the app
    init();

})();
