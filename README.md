# IntelliFlow AI

Enterprise Knowledge & Engineering Assistant — an AI-powered platform for uploading, searching, and interacting with company knowledge and engineering resources.

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Java 21, Spring Boot 3
- **AI Service:** Python, FastAPI
- **Database:** PostgreSQL
- **Vector Database:** Qdrant
- **Cache:** Redis
- **Object Storage:** MinIO
- **Deployment:** Docker, Docker Compose

## Architecture

Frontend → Spring Boot Backend (API Gateway) → Python AI Service → LLM APIs
                ↓                                      ↓
           PostgreSQL                              Qdrant (vectors)
                ↓                                      ↓
             Redis                                  MinIO (files)

## Local Development Setup

### Prerequisites
- Java 21
- Node.js 20+
- Python 3.11+
- Docker Desktop

### Running infrastructure

\`\`\`bash
docker compose up -d
\`\`\`

This starts PostgreSQL (5432), Qdrant (6333), Redis (6379), and MinIO (9000/9001).

### Project Structure

\`\`\`
intelliflow-ai/
  frontend/       # Next.js app
  backend/        # Spring Boot API
  ai-service/     # FastAPI AI service
\`\`\`

## Status

🚧 Under active development.