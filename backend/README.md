# Study Assistant Backend

This is the backend for the Study Assistant application, built with Django and Django REST Framework.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
- Windows:
```bash
venv\Scripts\activate
```
- Unix/MacOS:
```bash
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory with your OpenAI API key:
```
OPENAI_API_KEY=your-api-key-here
```

5. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Start the development server:
```bash
python manage.py runserver
```

The server will run at http://localhost:8000

## API Endpoints

### Documents
- `GET /api/documents/` - List all documents
- `POST /api/documents/` - Upload a new document
- `GET /api/documents/{id}/` - Get document details
- `DELETE /api/documents/{id}/` - Delete a document
- `POST /api/documents/{id}/generate_test/` - Generate a test from a document

### Tests
- `GET /api/tests/` - List all tests
- `GET /api/tests/{id}/` - Get test details

### Test Attempts
- `GET /api/test-attempts/` - List all test attempts
- `POST /api/test-attempts/` - Create a new test attempt
- `GET /api/test-attempts/{id}/` - Get test attempt details
- `POST /api/test-attempts/{id}/submit/` - Submit answers for a test attempt

## File Structure
```
backend/
├── study_assistant/
│   ├── models.py      # Database models
│   ├── serializers.py # API serializers
│   ├── views.py       # API views
│   └── urls.py        # URL routing
├── study_assistant_project/
│   ├── settings.py    # Django settings
│   └── urls.py        # Project URL configuration
├── requirements.txt   # Python dependencies
└── README.md         # This file
``` 