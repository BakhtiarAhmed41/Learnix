# 🌟 ConceptAI

**ConceptAI** is an AI-powered educational platform that helps students master their subjects by turning their own study materials into interactive tests. Whether it's class notes, textbooks, or personal summaries, ConceptAI can generate custom MCQs and Q&A-style exams — complete with explanations — to reinforce understanding and support exam readiness.

---

## 🚀 Key Features

- **Smart Uploads**  
  Upload notes, documents, or textbooks in various formats (PDF, DOCX, etc.).

- **AI-Generated Exams**  
  Choose your test type — MCQs or Question-Answer format — and let AI generate relevant questions instantly.

- **Interactive Test Interface**  
  Take tests directly in a clean, responsive UI that feels like a modern upgrade of Google Forms.

- **Auto-Grading & Explanations**  
  Get immediate results after submitting, with score breakdowns and AI-generated explanations for every answer.

- **Concept Mastery Feedback**  
  Understand not just what you got wrong, but why — helping you clarify concepts and improve faster.

---

## 🎯 Who It's For

- High school and university students  
- Self-learners and exam preppers  
- Tutors and educators seeking smart assessments  
- Anyone who learns better through testing and feedback

---

## 🧠 Why ConceptAI?

Learning isn't just about reading — it's about **testing, correcting, and improving**. ConceptAI helps you *actively engage* with your own notes and ensures you truly **understand your material**, not just memorize it.

# AI-Powered Educational Platform

An intelligent educational platform that generates custom tests from study materials and provides detailed feedback for better learning outcomes.

## Features

- 📚 Document Upload & Processing
  - Support for PDFs, text files, and images
  - Intelligent content extraction and analysis
  - Document organization and management

- 🤖 AI-Powered Test Generation
  - Multiple question types (MCQ, Short Answer, Long Answer)
  - Customizable test parameters
  - Context-aware question generation

- ✍️ Interactive Test Interface
  - Modern, responsive design
  - Real-time answer validation
  - Progress tracking

- 📊 Smart Assessment
  - Automated grading
  - Detailed answer explanations
  - Performance analytics
  - Concept clarity feedback

## Tech Stack

- Frontend: React.js with TypeScript
- Backend: Python FastAPI
- Database: PostgreSQL
- AI/ML: OpenAI GPT-4, LangChain
- Document Processing: PyPDF2, pytesseract
- Authentication: JWT

## Project Structure

```
concept-ai/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
│
├── backend/                 # FastAPI backend application
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Core functionality
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   └── tests/              # Backend tests
│
└── docs/                   # Documentation
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL
- OpenAI API key

### Backend Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Run the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Run the development server:
   ```bash
   npm start
   ```

## API Documentation

Once the backend server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details
