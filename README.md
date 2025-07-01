# StudyCompanion - Lightweight Study App

A beautiful, offline-first desktop study application designed specifically for Mitchell, featuring AI-powered study assistance, document management, and personalized study planning.

## ✨ Features

### 🎯 Core Functionality
- **Document Management**: Upload and organize PDFs and DOCX files by study units
- **Note Taking**: Markdown-style notes with `~` prefix support
- **AI Summaries**: Generate summaries with user approval workflow
- **Study Planning**: Daily study schedules with time tracking
- **Assignment Tracking**: Manage assignments and CATs with deadline monitoring
- **Progress Tracking**: Visual progress indicators and study streaks

### 🤖 AI-Powered Features
- **Study Companion Chat**: Friendly AI assistant for study help
- **Intelligent Summaries**: Document summarization with approval workflow
- **Study Plan Generation**: AI-generated study schedules based on deadlines and pace
- **Quiz Generation**: Create practice quizzes from study materials
- **Smart Break Reminders**: Context-aware break suggestions
- **Content Search**: AI-powered search through study materials

### 🎨 Design
- **Warm & Welcoming**: Beautiful beige and cream color palette
- **Sophisticated UI**: Mature yet approachable interface design
- **Smooth Animations**: Page flip loading, gentle transitions, celebration effects
- **Responsive Layout**: Works seamlessly across different screen sizes
- **Accessibility**: Focus states, proper contrast, keyboard navigation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- Ollama (will be installed by setup script)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/studycompanion.git
   cd studycompanion
   ```

2. **Run the setup script**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Configure environment** (optional but recommended)
   ```bash
   # Edit .env file and add your OpenAI API key for enhanced AI features
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5000`

## 🖥️ Desktop App (Tauri)

### Build Desktop Application

1. **Install Tauri CLI**
   ```bash
   cargo install tauri-cli
   ```

2. **Build the desktop app**
   ```bash
   npm run tauri build
   ```

3. **Development mode**
   ```bash
   npm run tauri dev
   ```

The installer will be created in `src-tauri/target/release/bundle/`

## 🛠️ Development

### Project Structure
