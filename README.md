# LangGraph Chatbot Suite

This repository contains a modular LangGraph-powered Chatbot project. It features multiple backend architectures (Standard, Database Persistence, MCP Tools, and PDF RAG) and provides both a **Next.js Web Frontend** (modern UI) and a suite of **Streamlit Frontends** (for quick Python-only execution).

---

## Prerequisites

Before running the application, make sure you have:

1. **Python 3.10+** installed.
2. **Node.js 18+** & **npm** installed (only needed for the Next.js UI).
3. **Ollama** installed locally.
   - Download Ollama from [ollama.com](https://ollama.com).
   - Pull the default Llama model used by this project:
     ```bash
     ollama pull llama3.2
     ```
   - Ensure Ollama is running in the background.

---

## Option 1: Modern Web App (FastAPI Backend + Next.js Frontend)

This setup runs the backend API on Python and the frontend on a Next.js development server.

### 1. Set Up the Backend
1. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows, use: venv\Scripts\activate
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. (Optional) Create a `.env` file at the root if you want to customize environment variables:
   ```env
   # Add environment variables here if needed
   ```
4. Start the FastAPI backend server:
   ```bash
   python api.py
   ```
   The backend will start running at `http://localhost:8000`.

### 2. Set Up the Next.js Frontend
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Next.js frontend:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000` to interact with the chatbot.

---

## Option 2: Streamlit Frontends (Python Only)

If you prefer to run a frontend entirely in Python without setting up Node.js/npm, you can run one of the included Streamlit apps.

### Setup
1. Create and activate a Python virtual environment (if you haven't already):
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Run
Choose the version you want to run:

* **Basic Chatbot**:
  ```bash
  streamlit run streamlit_frontend.py
  ```
* **PDF RAG (Retrieval Augmented Generation)**:
  Allows you to upload PDFs and ask questions about them.
  ```bash
  streamlit run streamlit_rag_frontend.py
  ```
* **Database Persisted Chat**:
  Stores chat threads in a SQLite database.
  ```bash
  streamlit run streamlit_frontend_database.py
  ```
* **MCP / Tools Chat**:
  Lets the chatbot run custom tools and search integrations.
  ```bash
  streamlit run streamlit_frontend_mcp.py
  ```
