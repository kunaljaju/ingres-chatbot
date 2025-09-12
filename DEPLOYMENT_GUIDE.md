# INGRES AI ChatBot - Deployment Guide

## 🚀 Quick Deployment

### Option 1: Automated Setup (Recommended)

**Windows:**
```cmd
setup.bat
```

**Linux/macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

1. **Clone and Setup:**
```bash
git clone <repository-url>
cd ingres-ai-chatbot
cp env.example .env
```

2. **Place Your Model Files:**
```bash
mkdir -p models/your-trained-model
# Copy your trained model files to this directory
```

3. **Start Services:**
```bash
# Development
docker-compose -f docker-compose.dev.yml up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

## 📁 Model File Placement

Place your trained groundwater model files in:
```
models/your-trained-model/
├── pytorch_model.bin    # PyTorch model weights
├── config.json         # Model configuration
├── tokenizer.json      # Tokenizer (if using transformers)
├── model.pkl          # Scikit-learn model (alternative)
├── scaler.pkl         # Feature scaler (optional)
└── features.json      # Feature column names (optional)
```

## 🔧 Configuration

### Environment Variables (.env)
```bash
# Database
POSTGRES_DB=ingres_groundwater
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password

# API URLs
API_BASE_URL=http://localhost:8000
MODEL_SERVER_URL=http://localhost:8001

# Model Path
MODEL_PATH=/models/your-trained-model
```

## 🌐 Access Points

After deployment, access your application at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Model Server**: http://localhost:8001
- **API Documentation**: http://localhost:8000/docs

## 🛠️ Management Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f model-server
docker-compose logs -f frontend
```

### Stop Services
```bash
# Development
docker-compose -f docker-compose.dev.yml down

# Production
docker-compose -f docker-compose.prod.yml down
```

### Restart Services
```bash
docker-compose restart
```

### Update Application
```bash
git pull
docker-compose build
docker-compose up -d
```

## 🔍 Health Checks

Verify all services are running:

```bash
# Frontend
curl http://localhost:3000

# Backend API
curl http://localhost:8000/health

# Model Server
curl http://localhost:8001/health

# Database
docker exec ingres-postgres pg_isready -U postgres
```

## 🚨 Troubleshooting

### Model Not Loading
1. Check model files are in correct location
2. Verify file permissions
3. Check model server logs: `docker logs ingres-model-server`

### Database Issues
1. Check database is running: `docker ps | grep postgres`
2. Verify connection: `docker exec ingres-postgres pg_isready -U postgres`
3. Check database logs: `docker logs ingres-postgres`

### Frontend Not Loading
1. Check frontend container: `docker ps | grep frontend`
2. Verify nginx config: `docker exec ingres-frontend nginx -t`
3. Check frontend logs: `docker logs ingres-frontend`

### Port Conflicts
If ports are already in use, modify the port mappings in docker-compose files:
```yaml
ports:
  - "3001:80"  # Change 3000 to 3001
```

## 📊 Monitoring

### Service Status
```bash
docker-compose ps
```

### Resource Usage
```bash
docker stats
```

### Disk Usage
```bash
docker system df
```

## 🔒 Security Considerations

### Production Deployment
1. Change default passwords in `.env`
2. Configure SSL certificates
3. Set up firewall rules
4. Enable rate limiting
5. Configure proper CORS settings
6. Set up monitoring and alerting

### SSL Configuration
1. Place SSL certificates in `deployment/nginx/ssl/`
2. Update nginx configuration
3. Use `--profile production` with docker-compose

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale backend services
docker-compose up -d --scale backend=3
```

### Load Balancing
Configure nginx upstream servers for multiple backend instances.

## 🗄️ Data Backup

### Database Backup
```bash
docker exec ingres-postgres pg_dump -U postgres ingres_groundwater > backup.sql
```

### Database Restore
```bash
docker exec -i ingres-postgres psql -U postgres ingres_groundwater < backup.sql
```

## 🔄 Updates

### Application Updates
```bash
git pull
docker-compose build
docker-compose up -d
```

### Model Updates
1. Stop model server: `docker-compose stop model-server`
2. Replace model files in `models/your-trained-model/`
3. Start model server: `docker-compose start model-server`

## 📞 Support

For deployment issues:
1. Check logs: `docker-compose logs -f`
2. Verify configuration: `.env` file
3. Test individual services
4. Create GitHub issue with logs and configuration

---

**Happy Deploying! 🚀**
