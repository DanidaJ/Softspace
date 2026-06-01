# 🌌 Softspace - Your Gentle Companion

A mental wellness application providing conversational AI support, mood tracking, journaling, and personalized wellness insights.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ⚠️ Important: First-Time Setup

**BEFORE YOU CLONE OR RUN THIS PROJECT**, you need to set up your environment variables. This project requires API keys that are **NOT** included in the repository for security.

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/DanidaJ/Softspace.git
cd Softspace
```

### 2. Backend Setup

```bash
cd backend

# Copy the example environment file
cp .env.example .env.local

# Edit .env.local and add your API keys:
# - Get Supabase keys from: https://supabase.com/dashboard
# - Get Gemini API key from: https://aistudio.google.com/apikey
# - Get Groq API key from: https://console.groq.com/keys
# - Get Mistral API key from: https://console.mistral.ai/api-keys/

# Install dependencies
pip install -r requirements.txt

# Set environment to development
export ENVIRONMENT=development  # On Windows: set ENVIRONMENT=development

# Run the backend
python run.py
```

### 3. Frontend Setup

```bash
cd ../frontend

# Copy the example environment file
cp .env.example .env.local

# Edit .env.local and add:
# VITE_API_URL=http://localhost:8000
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Install dependencies
npm install

# Run the frontend
npm run dev
```

### 4. Database Setup

1. Create a Supabase project at https://supabase.com
2. Run the SQL schema from `backend/database_schema.sql` in your Supabase SQL editor
3. Run any migrations from `backend/migrations/` folder

## 📁 Project Structure

```
Softspace/
├── backend/              # Python FastAPI backend
│   ├── app/
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   ├── models/      # Pydantic schemas
│   │   └── main.py      # FastAPI application
│   ├── .env.example     # Template for environment variables
│   └── requirements.txt # Python dependencies
│
├── frontend/            # React + TypeScript frontend
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── utils/          # Utilities and API client
│   ├── .env.example    # Template for environment variables
│   └── package.json    # Node dependencies
│
└── docs/               # Documentation
```

## 🔑 Required Environment Variables

### Backend (.env.local)
```bash
ENVIRONMENT=development
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
MISTRAL_API_KEY=your_mistral_api_key
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend (.env.local)
```bash
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Supabase** - Database and authentication
- **Google Gemini AI** - Conversational AI
- **Groq** - Fast AI inference
- **Mistral AI** - Advanced language model

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation

## 🌟 Features

- 🤖 **AI Companion** - Empathetic conversational support using multiple AI models
- 📊 **Mood Tracking** - Track emotions with visual insights
- 📝 **Journaling** - Guided journaling with AI feedback
- 🎯 **Goal Setting** - Therapeutic goals and progress tracking
- 🧘 **Coping Tools** - Breathing exercises and grounding techniques
- 📈 **Insights Dashboard** - Weekly patterns and trends
- 🔒 **Privacy-First** - Your data stays secure with row-level security

## 🧪 API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 📦 Production Deployment

See [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for detailed deployment instructions including:
- Environment variable configuration
- Docker setup
- Platform-specific guides (Vercel, Railway, Heroku)
- Security hardening checklist

## 🔐 Security

- All sensitive data is protected by Supabase Row Level Security (RLS)
- API keys are never committed to the repository
- CORS is properly configured for production
- Rate limiting is implemented on all endpoints
- JWT authentication via Supabase

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Important**: Never commit `.env` files or any files containing API keys!

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter issues:
1. Check that all environment variables are set correctly
2. Ensure your API keys are valid
3. Verify the backend is running on port 8000
4. Check the console for error messages

## 🙏 Acknowledgments

- Supabase for backend infrastructure
- Google, Groq, and Mistral for AI capabilities
- The open-source community

----

**Made with ❤️ for mental wellness**
