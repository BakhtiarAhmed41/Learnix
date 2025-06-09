# ConceptAI - AI-Powered Educational Platform

ConceptAI is a modern web application that helps students learn more effectively by using AI to generate personalized tests from their study materials.

## Features

- Document Upload: Upload study materials in various formats (PDF, DOC, DOCX, TXT)
- AI-Generated Tests: Get personalized tests based on your uploaded content
- Multiple Question Types: Multiple choice, true/false, and short answer questions
- Progress Tracking: Monitor your learning progress and identify areas for improvement
- Instant Feedback: Get immediate feedback on your answers

## Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- React Router
- Axios

### Backend
- Django
- Django REST Framework
- PostgreSQL
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- PostgreSQL

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up the database:
   ```bash
   python manage.py migrate
   ```

5. Start the development server:
   ```bash
   python manage.py runserver
   ```

## Environment Variables

### Frontend
Create a `.env` file in the frontend directory:
```
VITE_API_URL=http://localhost:8000/api
```

### Backend
Create a `.env` file in the backend directory:
```
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@localhost:5432/conceptai
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
