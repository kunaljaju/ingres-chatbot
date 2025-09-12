# INGRES AI ChatBot - Groundwater Intelligence System

A complete, modern, futuristic web application for groundwater prediction and analysis using AI technology. Built with FastAPI backend, React frontend, and comprehensive multilingual support for Indian languages.

## 🌟 Features

### 🤖 AI-Powered Groundwater Prediction
- **Custom Trained Model**: Load and serve your trained groundwater prediction model
- **Fallback System**: Automatic fallback to heuristic-based predictions
- **Real-time Predictions**: Get instant groundwater level forecasts for any location and year
- **Confidence Scoring**: AI confidence levels for prediction reliability

### 🌐 Multilingual Support
Support for 12+ Indian languages:
- English (en)
- Hindi (hi) - हिन्दी
- Marathi (mr) - मराठी
- Tamil (ta) - தமிழ்
- Bengali (bn) - বাংলা
- Kannada (kn) - ಕನ್ನಡ
- Telugu (te) - తెలుగు
- Gujarati (gu) - ગુજરાતી
- Malayalam (ml) - മലയാളം
- Punjabi (pa) - ਪੰਜਾਬੀ
- Urdu (ur) - اردو
- Odia (or) - ଓଡ଼ିଆ

### 🎨 Futuristic Dark UI
- **Glassmorphism Design**: Translucent panels with blurred backgrounds
- **Neon Glowing Elements**: Indian flag colors (saffron #FF9933, green #138808) with glowing effects
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Responsive Design**: Mobile, tablet, and desktop optimized
- **Accessibility**: ARIA roles, keyboard navigation, and screen reader support

### 📊 Advanced Analytics
- **Historical Data Analysis**: View groundwater trends over time
- **Interactive Charts**: Plotly-powered data visualization
- **Model Performance Tracking**: Monitor prediction accuracy and usage
- **Real-time Insights**: AI-generated recommendations and alerts

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  FastAPI Backend │    │  Model Server   │
│                 │    │                 │    │                 │
│ • Chat Interface│◄──►│ • REST API      │◄──►│ • Custom Model  │
│ • Predictions   │    │ • Health Checks │    │ • Inference     │
│ • Analytics     │    │ • Data Storage  │    │ • Model Info    │
│ • Multilingual  │    │ • Error Handling│    │ • File Listing  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │   PostgreSQL    │              │
         │              │                 │              │
         └──────────────►│ • Groundwater   │◄─────────────┘
                        │   Data         │
                        │ • Predictions  │
                        │ • Analytics    │
                        └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git
- 4GB+ RAM available
- 10GB+ disk space

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ingres-ai-chatbot.git
cd ingres-ai-chatbot
```

### 2. Place Your Model Files
Create the model directory and place your trained model files:
```bash
mkdir -p models/your-trained-model
```

**Required Model Files:**
- `pytorch_model.bin` - PyTorch model weights
- `config.json` - Model configuration
- `tokenizer.json` - Tokenizer (if using transformers)
- `model.pkl` - Scikit-learn model (alternative)
- `scaler.pkl` - Feature scaler (optional)
- `features.json` - Feature column names (optional)

**Example Model Structure:**
```
models/your-trained-model/
├── pytorch_model.bin
├── config.json
├── tokenizer.json
├── scaler.pkl
└── features.json
```

### 3. Configure Environment
```bash
cp env.example .env
# Edit .env with your configuration
```

### 4. Start the Application
```bash
# Development mode
docker-compose -f docker-compose.dev.yml up -d

# Production mode
docker-compose -f docker-compose.prod.yml up -d
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Model Server**: http://localhost:8001
- **API Documentation**: http://localhost:8000/docs

## 📁 Project Structure

```
ingres-ai-chatbot/
├── backend/                    # FastAPI backend
│   ├── main.py                # Main API server
│   ├── model_server.py        # Custom model server
│   ├── models/                # Model management
│   │   ├── groundwater_model.py
│   │   └── database.py
│   ├── schemas/               # Pydantic schemas
│   │   ├── prediction.py
│   │   └── health.py
│   ├── utils/                 # Utilities
│   │   └── logger.py
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile            # Backend container
│   └── Dockerfile.model-server # Model server container
├── frontend/ingres_chatbot/   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── layout/        # Header, Footer
│   │   │   ├── chat/          # Chat interface
│   │   │   ├── prediction/    # Prediction panel
│   │   │   ├── history/       # History panel
│   │   │   └── analytics/     # Analytics dashboard
│   │   ├── i18n/             # Internationalization
│   │   │   ├── index.js
│   │   │   └── locales/       # Language files
│   │   ├── services/         # API services
│   │   ├── stores/           # State management
│   │   └── App.jsx           # Main app component
│   ├── package.json          # Node dependencies
│   ├── tailwind.config.js    # Tailwind configuration
│   ├── Dockerfile           # Frontend container
│   └── nginx.conf           # Nginx configuration
├── database/                 # Database setup
│   └── schema.sql           # PostgreSQL schema
├── deployment/              # Deployment configs
│   └── nginx/              # Nginx configurations
├── models/                  # Your trained models
│   └── your-trained-model/  # Place your model files here
├── docker-compose.yml       # Main compose file
├── docker-compose.dev.yml   # Development compose
├── docker-compose.prod.yml  # Production compose
├── env.example             # Environment template
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_DB` | Database name | `ingres_groundwater` |
| `POSTGRES_USER` | Database user | `postgres` |
| `POSTGRES_PASSWORD` | Database password | Required |
| `API_BASE_URL` | Backend API URL | `http://localhost:8000` |
| `MODEL_SERVER_URL` | Model server URL | `http://localhost:8001` |
| `MODEL_PATH` | Model directory path | `/models/your-trained-model` |
| `LOG_LEVEL` | Logging level | `info` |

### Model Configuration

The system supports multiple model formats:

1. **PyTorch Models**:
   - `pytorch_model.bin` - Model weights
   - `config.json` - Model configuration

2. **Scikit-learn Models**:
   - `model.pkl` - Trained model

3. **Transformers Models**:
   - `tokenizer.json` - Tokenizer
   - Model files in HuggingFace format

4. **Optional Files**:
   - `scaler.pkl` - Feature scaler
   - `features.json` - Feature column names

## 🛠️ Development

### Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
cd frontend/ingres_chatbot
npm install
npm run dev
```

### Database Setup
```bash
# Create database
createdb ingres_groundwater

# Run schema
psql ingres_groundwater < database/schema.sql
```

## 📊 API Endpoints

### Backend API (`/api/`)
- `POST /predict` - Generate groundwater prediction
- `POST /history` - Get historical data
- `GET /health` - Health check
- `GET /docs` - API documentation

### Model Server (`/model/`)
- `POST /predict` - Model prediction
- `GET /model-info` - Model information
- `GET /model-files` - List model files
- `GET /health` - Model server health

## 🎨 Customization

### Adding New Languages
1. Create translation file in `frontend/ingres_chatbot/src/i18n/locales/`
2. Add language to `i18n/index.js`
3. Update language selector in `Header.jsx`

### Styling Customization
- Edit `tailwind.config.js` for theme colors
- Modify `src/index.css` for custom styles
- Update component styles in individual files

### Model Integration
1. Place your model files in `/models/your-trained-model/`
2. Update `GroundwaterModelManager` if needed
3. Test with `/model/model-info` endpoint

## 🚀 Deployment

### Production Deployment
```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up -d

# With SSL (configure certificates first)
docker-compose -f docker-compose.prod.yml --profile production up -d
```

### Scaling
```bash
# Scale backend services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

### Monitoring
- Health checks: `curl http://localhost/health`
- API health: `curl http://localhost:8000/health`
- Model health: `curl http://localhost:8001/health`

## 🔒 Security

### Production Security Checklist
- [ ] Change default passwords
- [ ] Configure SSL certificates
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Set up monitoring and logging
- [ ] Regular security updates

## 🐛 Troubleshooting

### Common Issues

**Model not loading:**
```bash
# Check model files
docker exec -it ingres-model-server ls -la /models/your-trained-model/

# Check model server logs
docker logs ingres-model-server
```

**Database connection issues:**
```bash
# Check database status
docker exec -it ingres-postgres pg_isready -U postgres

# Check database logs
docker logs ingres-postgres
```

**Frontend not loading:**
```bash
# Check frontend logs
docker logs ingres-frontend

# Check nginx configuration
docker exec -it ingres-nginx nginx -t
```

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f model-server
docker-compose logs -f frontend
```

## 📈 Performance Optimization

### Backend Optimization
- Enable Redis caching
- Optimize database queries
- Use connection pooling
- Implement request rate limiting

### Frontend Optimization
- Enable gzip compression
- Optimize bundle size
- Use CDN for static assets
- Implement lazy loading

### Model Optimization
- Use model quantization
- Implement batch processing
- Cache model predictions
- Optimize feature preprocessing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- FastAPI for the excellent Python web framework
- React for the powerful frontend library
- Tailwind CSS for the utility-first CSS framework
- Framer Motion for smooth animations
- Plotly for interactive charts
- The open-source community for inspiration and tools

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@ingres-ai.com
- Documentation: https://docs.ingres-ai.com

---

**Built with ❤️ for sustainable water management in India**
