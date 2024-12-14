![Providence's Logo](https://github.com/providence-replay/.github/blob/main/assets/transparent-logo.png)

Providence is an open-source session replay tool for single-page applications that uncovers insights from user interactions. By incorporating AI session analysis, aggregated session trends, and an RAG chatbot for contextual exploration, Providence helps developers understand and improve user experiences.

## Getting Started

Setting up Providence involves two main steps:

1. **Deploy the Providence Infrastructure** (this repository)
   - Choose between a local Docker Compose setup or a tailored Amazon AWS cloud deployment.
   - Sets up the backend services, data stores, and dashboard UI.

2. **Instrument Your Application** 
   - Add the Providence Agent to your app.
   - Configure session recording.
   - Visit the [Agent repository](https://github.com/providence-replay/agent) for instrumentation instructions after your Providence infrastructure is set up.

## Infrastructure Setup Options

### Option 1: Local setup with Docker
Continue with the instructions below.

### Option 2: AWS Deployment
Visit our [deployment repository](https://github.com/providence-replay/deploy) to get Providence running in your own AWS cloud environment.

## Local Setup Instructions

### Prerequisites

- [Docker](https://www.docker.com/get-started/) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/en) v20 or later
- [Git](https://git-scm.com/)
- [OpenAI API key](https://platform.openai.com/api-keys) (for leveraging AI insights)
- [FindIP](https://findip.net/) API key (for session geolocation stamping)

### Setup Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/providence-replay/providence.git
   cd providence
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   
   **Follow the .env.example as your guide. All listed variables are required. Remember to use strong passwords & secrets!**

   - For a development configuration where the frontend will be spun up in its own container, set the variable `NODE_ENV` to `development`.
   - For a production configuration where the frontend will be served out of the backend Express server, set your `NODE_ENV` to `production`.

4. **Start Services**

   - Development:
      ```bash
      docker-compose up -d
      ```

   - Production:
      ```bash
      docker-compose up -d backend
      ```

5. **Access Providence**
   - View the Dashboard:
      - http://localhost:5173 (development configuration)
      - http://localhost:5001 (production configuration)
   - API: http://localhost:5001/api

6. **Next Steps**
   - Visit the [Agent repository](https://github.com/providence-replay/agent) for instructions on instrumenting your application.

## Architecture Overview

![Providence's Architecture Diagram](https://github.com/providence-replay/providence-replay.github.io/blob/044332ff9a7425dc1ba70f890bb3c5b2156ae010/docs/public/final_arch.png)

Providence consists of several key components:

- **Frontend**: React-based dashboard for session replay and analysis
- **Backend**: Node.js/Express API handling session processing and AI integration
- **Agent**: Lightweight JavaScript client for capturing user sessions
- **Storage Layer**:
  - PostgreSQL for metadata and summaries
  - Redis for active session events
  - MinIO/S3 for session storage
  - Qdrant for vector embeddings
