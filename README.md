# 🤖 AI Design Assistant for Adobe Illustrator

A powerful CEP extension that brings Google Gemini AI directly into Adobe Illustrator, helping you with design tasks, artwork analysis, color palettes, and creative suggestions.

## ✨ Features

### 🎨 Design Analysis
- Capture and analyze your artboards
- Get detailed feedback on composition, colors, and typography
- Receive actionable improvement suggestions

### 🖼️ Image Generation
- Generate images from text descriptions
- Create logos, illustrations, and design assets
- Use natural language to describe what you want

### 🎨 Color Intelligence
- Extract color palettes from your designs
- Get complementary color suggestions
- Understand color psychology and usage

### 💬 Conversational AI
- Chat naturally with the AI about design
- Ask design questions and get expert answers
- Multi-turn conversations with context awareness

### 📸 Artboard Integration
- Capture current artboard as screenshot
- Analyze existing artwork
- Get suggestions based on your work

## 📦 Installation

### Quick Install (Recommended)

1. **Download** the extension files
2. **Right-click** on `INSTALL.bat`
3. Select **"Run as administrator"**
4. Follow the on-screen instructions

### Manual Installation

1. Copy the `AIAssistantPanel` folder to:
   ```
   Windows: C:\Users\YOUR_USERNAME\AppData\Roaming\Adobe\CEP\extensions\
   Mac: ~/Library/Application Support/Adobe/CEP/extensions/
   ```

2. Enable CEP debug mode:

   **Windows:**
   - Run Registry Editor (regedit)
   - Navigate to `HKEY_CURRENT_USER\Software\Adobe\CSXS.10`
   - Create String Value: `PlayerDebugMode` = `1`
   - Repeat for CSXS.7, CSXS.8, CSXS.9, CSXS.11

   **Mac:**
   ```bash
   defaults write com.adobe.CSXS.10 PlayerDebugMode 1
   ```

3. Restart Adobe Illustrator

## 🔑 Getting Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"**
4. Copy your API key
5. **IMPORTANT:** Keep your API key secret and never share it

### API Key Pricing
- Gemini API offers a **FREE tier** with generous limits
- Perfect for individual designers and small projects
- Check current pricing at [Google AI Pricing](https://ai.google.dev/pricing)

## 🚀 Getting Started

1. **Open Adobe Illustrator**

2. **Open the Extension**
   - Go to `Window → Extensions → AI Design Assistant`

3. **Configure API Key**
   - Paste your Gemini API key in the input field
   - Click "Save"
   - You'll see "✅ API key configured"

4. **Start Creating!**

## 💡 Usage Examples

### Quick Actions

Use the quick action buttons for common tasks:

- **🎨 Analyze Artboard** - Get comprehensive design feedback
- **✨ Generate Image** - Create images from text
- **🎨 Color Palette** - Extract and suggest colors
- **💡 Improvement Tips** - Get actionable suggestions

### Example Prompts

**Image Generation:**
```
Generate a modern, minimalist logo for a tech startup
Create a vintage poster design with art deco elements
Design a cute mascot character for a coffee shop
```

**Design Analysis:**
```
Analyze this design's color harmony
What's the visual hierarchy in this composition?
Suggest improvements for better readability
```

**Color Assistance:**
```
Extract the color palette and suggest complementary colors
What emotions do these colors convey?
Recommend a color scheme for a wellness brand
```

**Creative Help:**
```
Give me 5 ideas for a music festival poster
What typography would work well for this design?
How can I make this more visually balanced?
```

## 📸 Working with Artboards

### Capture Current Artboard

1. Click the 📎 attachment button
2. Wait for "✅ Artboard captured!"
3. Ask questions about your design
4. Get AI-powered feedback

### Best Practices

- Work on one artboard at a time for best results
- Ensure your design is visible and not hidden
- Use high-contrast elements for better analysis
- Save your work before making AI-suggested changes

## 🎯 Tips for Best Results

### Prompt Engineering

**Be Specific:**
```
❌ "Make a logo"
✅ "Create a minimalist logo for 'CloudTech' with geometric shapes and blue gradient"
```

**Provide Context:**
```
❌ "Improve this"
✅ "Improve this brochure design for a luxury real estate company, focusing on elegance and trust"
```

**Iterative Refinement:**
```
1. "Generate a coffee shop logo"
2. "Make it warmer and more inviting"
3. "Add a subtle coffee bean element"
```

### Design Analysis

- Capture your artboard before asking for analysis
- Ask specific questions for targeted feedback
- Use the quick action buttons for common tasks
- Follow up on suggestions to refine ideas

## 🔧 Troubleshooting

### Extension Not Showing

1. Verify installation path is correct
2. Check CEP debug mode is enabled
3. Restart Illustrator completely
4. Check Windows → Extensions menu

### API Key Issues

```
Error: API key not configured
→ Enter and save your API key

Error: API request failed
→ Check your API key is valid
→ Verify internet connection
→ Check API quota limits
```

### Artboard Capture Fails

```
Error: No document is open
→ Create or open a document first

Error: No artboards found
→ Create an artboard in your document
```

### Connection Issues

- Check your internet connection
- Verify firewall isn't blocking requests
- Try disabling VPN if enabled
- Check Google AI Studio status

## 🛡️ Privacy & Security

- Your API key is stored locally in your browser
- Images are sent to Google's Gemini API for processing
- No data is stored on external servers
- Keep your API key confidential
- Review [Google AI Terms of Service](https://policies.google.com/terms/generative-ai)

## 📋 System Requirements

- **Adobe Illustrator:** CC 2015 or later
- **Operating System:** Windows 10+ or macOS 10.12+
- **Internet:** Active connection required
- **Browser:** Modern browser (for API key management)

## 🎓 Learning Resources

### Gemini Documentation
- [Image Understanding Guide](https://ai.google.dev/gemini-api/docs/image-understanding)
- [Image Generation Guide](https://ai.google.dev/gemini-api/docs/image-generation)
- [Prompting Best Practices](https://ai.google.dev/gemini-api/docs/prompting-introduction)

### Adobe CEP
- [CEP Getting Started](https://github.com/Adobe-CEP/Getting-Started-guides)
- [ExtendScript Toolkit](https://www.adobe.com/devnet/scripting.html)

## ⚡ Keyboard Shortcuts

- `Enter` - Send message
- `Shift + Enter` - New line in message
- `Ctrl/Cmd + A` (in input) - Select all text

## 🔄 Updates

Check for updates regularly at the project repository to get:
- New features and capabilities
- Performance improvements
- Bug fixes
- Enhanced AI models


## 💬 Support

For issues, questions, or feature requests:
1. Check this README thoroughly
2. Review the troubleshooting section
3. Check Google AI Studio documentation
4. Verify your API key is valid

## 📝 License

This extension is provided as-is for personal and commercial use.
Gemini API usage is subject to Google's terms of service.

## 🙏 Credits

- **AI Model:** Google Gemini 2.5 Flash
- **Framework:** Adobe CEP (Common Extensibility Platform)
- **Design:** Custom gradient UI

---

## 🚀 Quick Start Checklist

- [ ] Install extension using INSTALL_AI_ASSISTANT.bat
- [ ] Get Gemini API key from Google AI Studio
- [ ] Open Adobe Illustrator
- [ ] Open extension: Window → Extensions → AI Design Assistant
- [ ] Enter and save API key
- [ ] Try a quick action button
- [ ] Start creating with AI!

---

**Made with ❤️ for designers who love AI**

*Version 1.0.0*
