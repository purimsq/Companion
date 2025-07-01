#!/bin/bash

# StudyCompanion Setup Script
# This script sets up the local AI environment for StudyCompanion

echo "🎓 Setting up StudyCompanion - Lightweight Study App"
echo "=================================================="

# Check if running on supported OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    OS="windows"
else
    echo "❌ Unsupported operating system: $OSTYPE"
    exit 1
fi

echo "🔍 Detected OS: $OS"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install Ollama if not present
install_ollama() {
    echo "📦 Installing Ollama..."
    
    if [[ "$OS" == "linux" ]] || [[ "$OS" == "macos" ]]; then
        curl -fsSL https://ollama.com/install.sh | sh
    elif [[ "$OS" == "windows" ]]; then
        echo "🔗 Please download and install Ollama from: https://ollama.com/download/windows"
        echo "   After installation, please run this script again."
        exit 1
    fi
}

# Check if Ollama is installed
if command_exists ollama; then
    echo "✅ Ollama is already installed"
else
    echo "❌ Ollama not found"
    install_ollama
fi

# Start Ollama service
echo "🚀 Starting Ollama service..."
if [[ "$OS" == "linux" ]]; then
    systemctl --user start ollama || ollama serve &
elif [[ "$OS" == "macos" ]]; then
    brew services start ollama || ollama serve &
elif [[ "$OS" == "windows" ]]; then
    echo "Please start Ollama service manually or ensure it's running"
fi

# Wait for Ollama to start
echo "⏳ Waiting for Ollama service to start..."
sleep 5

# Check if Ollama is running
if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    echo "✅ Ollama service is running"
else
    echo "❌ Failed to start Ollama service"
    echo "Please check the installation and try again"
    exit 1
fi

# Pull the phi model
echo "🤖 Pulling phi model for AI assistance..."
if ollama pull phi; then
    echo "✅ Phi model downloaded successfully"
else
    echo "❌ Failed to download phi model"
    echo "Please check your internet connection and try again"
    exit 1
fi

# Create necessary directories
echo "📁 Creating application directories..."
mkdir -p uploads
mkdir -p data
mkdir -p logs

# Set up environment variables file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating environment configuration..."
    cat > .env << EOL
# StudyCompanion Environment Configuration

# OpenAI API Key (for enhanced AI features)
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=phi

# Application Configuration
NODE_ENV=development
PORT=5000
EOL
    echo "⚠️  Please edit .env file and add your OpenAI API key for enhanced AI features"
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
if command_exists npm; then
    npm install
else
    echo "❌ Node.js/npm not found. Please install Node.js first."
    exit 1
fi

# Build the application
echo "🔨 Building the application..."
npm run build

echo ""
echo "🎉 StudyCompanion setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit the .env file and add your OpenAI API key (optional but recommended)"
echo "2. Start the application with: npm run dev"
echo "3. Open your browser to: http://localhost:5000"
echo ""
echo "🤖 AI Features available:"
echo "   - Local AI chat using Ollama + phi model"
echo "   - Enhanced AI features with OpenAI (requires API key)"
echo "   - Document summarization"
echo "   - Study plan generation"
echo "   - Quiz creation"
echo ""
echo "📖 For Tauri desktop app:"
echo "   - Install Tauri CLI: cargo install tauri-cli"
echo "   - Build desktop app: cargo tauri build"
echo ""
echo "Happy studying! 📚✨"
