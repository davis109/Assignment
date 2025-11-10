# Production-grade Invoice Analytics Platform

[![Next.js](https://img.shields.io/badge/Next.js-14+-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5+-brightgreen)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Full-stack analytics platform** with AI-powered natural language queries for invoice data analysis.

## 🎯 Overview

A production-grade web application featuring:
- **Interactive Analytics Dashboard** - Real-time invoice analytics with pixel-accurate UI
- **Chat with Data** - Natural language queries powered by Vanna AI and Groq

## ✨ Features

### Core Features
- 📊 **Real-time Dashboard** - Live invoice analytics and insights
- 💬 **AI Chat Interface** - Natural language to SQL conversion
- 📈 **Advanced Charts** - Invoice trends, vendor analysis, category breakdown
- 📋 **Data Tables** - Searchable, sortable, paginated invoice lists
- 📥 **Export** - CSV/Excel export functionality
- 🔍 **Filters** - Advanced search and filtering capabilities

### Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Recharts
- **Backend**: Express.js, TypeScript, Prisma ORM
- **Database**: PostgreSQL 16
- **AI**: Vanna AI + Groq LLM
- **Deployment**: Vercel (Frontend/API) + Render/Railway (Vanna)

## 🚀 Quick Start

### Automated Installation

```powershell
# Clone repository
git clone <your-repo-url>
cd flowbit

# Run installation script
.\install.ps1

# Start development
npm run dev
```

Visit: http://localhost:3000

### Manual Installation

See [QUICKSTART.md](QUICKSTART.md) for detailed steps.

## 📖 Documentation

- **[Quick Start Guide](QUICKSTART.md)** - Get up and running in 5 minutes
- **[Setup Instructions](SETUP.md)** - Detailed installation guide
- **[API Documentation](docs/API.md)** - Complete API reference
- **[Database Schema](docs/ER_DIAGRAM.md)** - ER diagram and schema details
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Project Status](PROJECT_STATUS.md)** - Implementation roadmap

## 🏗️ Architecture

```
┌──────────────────────┐
│   Next.js Frontend   │
│   (Port 3000)        │
└──────────┬───────────┘
           │
           │ REST API
           │
┌──────────▼───────────┐      ┌─────────────────┐
│   Express Backend    │◄────►│   Vanna AI      │
│   (Port 3001)        │      │   (Port 8000)   │
└──────────┬───────────┘      └────────┬────────┘
           │                           │
           │                           │
    ┌──────▼───────────────────────────▼─────┐
    │         PostgreSQL Database             │
    └────────────────────────────────────────┘
```

## 📁 Project Structure

```
flowbit/
├── apps/
│   ├── web/              # Next.js frontend
│   │   ├── app/          # App router
│   │   ├── components/   # React components
│   │   └── lib/          # Utilities
│   └── api/              # Express backend
│       ├── src/routes/   # API endpoints
│       └── prisma/       # Database schema
├── services/
│   └── vanna/            # Python Vanna AI
├── data/                 # Test data
├── docs/                 # Documentation
└── docker-compose.yml    # Docker config
```

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stats` | GET | Dashboard statistics |
| `/api/invoices` | GET | List invoices (paginated) |
| `/api/invoice-trends` | GET | Monthly trends |
| `/api/vendors/top10` | GET | Top 10 vendors |
| `/api/category-spend` | GET | Category breakdown |
| `/api/cash-outflow` | GET | Cash forecast |
| `/api/chat-with-data` | POST | AI chat queries |
| `/api/export/csv` | POST | Export to CSV |

See [API Documentation](docs/API.md) for details.

## 🗄️ Database Schema

**Tables**: `vendors`, `customers`, `invoices`, `line_items`, `payments`, `chat_history`

See [ER Diagram](docs/ER_DIAGRAM.md) for complete schema.

## 🧪 Development

```powershell
# Start all services
npm run dev

# Start database only
docker-compose up -d postgres

# View database
cd apps/api
npm run db:studio

# Run tests
npm test

# Build for production
npm run build
```

## 🚀 Deployment

### Vercel (Frontend + API)
```bash
vercel --prod
```

### Database (Neon/Supabase)
```bash
# Update DATABASE_URL in Vercel environment variables
```

### Vanna AI (Render/Railway)
```bash
# Deploy from services/vanna directory
```

See [Deployment Guide](docs/DEPLOYMENT.md) for complete instructions.

## 📊 Screenshots

*Coming soon - add screenshots of your dashboard here*

## 🎥 Demo Video

*Coming soon - add link to demo video*

## 🏆 Features Implemented

### Core Requirements ✅
- [x] Interactive Analytics Dashboard
- [x] Overview Cards (Total Spend, Invoices, Documents, Avg Value)
- [x] Invoice Volume + Value Trend (Line Chart)
- [x] Top 10 Vendors by Spend (Bar Chart)
- [x] Spend by Category (Pie Chart)
- [x] Cash Outflow Forecast (Bar Chart)
- [x] Searchable/Sortable Invoices Table
- [x] Chat with Data Interface
- [x] Natural Language to SQL
- [x] PostgreSQL Database
- [x] Normalized Schema
- [x] REST API Endpoints
- [x] TypeScript Throughout

### Bonus Features 🎁
- [x] CSV Export
- [x] Chat History Persistence
- [x] Docker Containerization
- [x] Comprehensive Documentation
- [x] Production-Ready Architecture
- [x] Sample Data Generation
- [x] Connection Pooling Support

## 🛠️ Tech Stack Details

### Frontend
- **Framework**: Next.js 14.2+ (App Router)
- **Language**: TypeScript 5.4+
- **Styling**: Tailwind CSS 3.4+
- **Components**: shadcn/ui
- **Charts**: Recharts
- **State**: TanStack Query
- **Tables**: TanStack Table

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.19+
- **Language**: TypeScript 5.4+
- **ORM**: Prisma 5.14+
- **Database**: PostgreSQL 16
- **Validation**: Zod

### AI Service
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **AI**: Vanna AI
- **LLM**: Groq (llama-3.1-70b)
- **DB Driver**: psycopg3

### Infrastructure
- **Monorepo**: Turborepo
- **Containerization**: Docker + Docker Compose
- **Frontend Hosting**: Vercel
- **API Hosting**: Vercel Serverless
- **AI Hosting**: Render/Railway/Fly.io
- **Database**: Neon/Supabase/Railway

## 📝 Environment Variables

```env
# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Backend
DATABASE_URL=postgresql://user:pass@host:5432/dbname
PORT=3001
CORS_ORIGIN=http://localhost:3000
VANNA_API_BASE_URL=http://localhost:8000

# Vanna AI
GROQ_API_KEY=your_groq_api_key
```

## 🐛 Troubleshooting

See [SETUP.md](SETUP.md#troubleshooting) for common issues and solutions.

## 🤝 Contributing

This is a selection project. Not accepting contributions at this time.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Built with ❤️ for the selection process

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- Vanna AI for the natural language SQL capabilities
- shadcn for the beautiful UI components

---

## 📞 Support

For questions or issues:
1. Check the [documentation](docs/)
2. Review [troubleshooting guide](SETUP.md#troubleshooting)
3. Check existing issues
4. Open a new issue

---

**⭐ If you found this useful, please star the repository!**

---

## 🎯 Live Demo

- **Frontend**: [Coming Soon]
- **API**: [Coming Soon]
- **Demo Video**: [Coming Soon]

---

Built with modern best practices and production-ready architecture. Ready to impress! 🚀
