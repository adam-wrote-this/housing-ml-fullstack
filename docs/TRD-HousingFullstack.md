# Technical Requirement Document
# Housing Price Prediction Fullstack System
Version: V1.0

## Table of Contents
1. [Document Overview](#1-document-overview)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Task 1: ML Housing Regression Inference Service](#3-task-1-ml-housing-regression-inference-service)
4. [Task 2: Unified Next.js Multi-Backend Portal](#4-task-2-unified-nextjs-multi-backend-portal)
5. [Global Non-Functional Requirements](#5-global-non-functional-requirements)
6. [Containerization & Deployment Specification](#6-containerization--deployment-specification)
7. [Source Code Delivery & Directory Standard](#7-source-code-delivery--directory-standard)
8. [Interview Demo Verification Checklist](#8-interview-demo-verification-checklist)
9. [Glossary](#9-glossary)

---

## 1. Document Overview
### 1.1 Purpose
This TRD records all functional, technical, UI/UX, deployment requirements from the fullstack interview assessment. It unifies implementation standards, interface specifications, technical constraints, deliverables and reproducible deployment rules for interview review.

### 1.2 Scope
1. Task 1: Dockerized FastAPI ML regression inference service for housing price prediction
2. Task 2: Next.js App Router unified frontend portal integrating two heterogeneous backend services
    - App1 Backend: Python FastAPI (property submission business service)
    - App2 Backend: Java SpringBoot 3.4.4 (market analysis & what-if simulation service)
3. Cross-service communication, container orchestration, accessibility specification, global loading & error handling

### 1.3 Core Constraint
All technical stack limits defined in the original interview tasks must be strictly followed without modification.

---

## 2. System Architecture Overview
The system consists of 4 decoupled independent services communicating via internal Docker bridge network.
1. ML Inference Service (Task1): Core prediction model provider
2. Python FastAPI Backend (App1): Simple housing form business layer
3. Java SpringBoot Backend (App2): Market filter & what-if simulation business layer
4. Next.js Frontend Portal: Single entry UI with two isolated business modules

### Mandatory Data Flow Rule
```
Next.js Frontend → Python / Java Backend → ML Inference Service
```
Frontend is forbidden to directly call ML service APIs.

---

## 3. Task 1: ML Housing Regression Inference Service
### 3.1 Objective
Train a scikit-learn linear regression model based on housing feature dataset, encapsulate inference logic as REST API, and containerize the service for remote calls from two downstream backends.

### 3.2 Mandatory Technical Stack
- Python version: 3.12 or higher
- Core dependencies: FastAPI, scikit-learn, pandas, joblib, pydantic, uvicorn
- Built-in OpenAPI / Swagger UI enabled by default

### 3.3 API Functional Specifications
#### 3.3.1 `GET /health`
- Purpose: Container liveness & readiness health probe
- Return: HTTP 200, JSON with service status and model loaded flag
- No request body required

#### 3.3.2 `POST /predict`
Support two input formats: single housing feature object and batch feature array
- All input fields validated via Pydantic schema
- Return a matching array of predicted housing prices
- Capture invalid input, missing field, type mismatch errors and return readable error messages

#### 3.3.3 `GET /model-info`
Return static metadata generated during training:
1. Feature coefficients and model intercept
2. Regression evaluation metrics: R², RMSE, MSE, MAE

### 3.4 Model Training & Persistence Rules
1. Independent training script `train.py`, separated from inference runtime code
2. Process: Load CSV dataset → train/test split → fit LinearRegression
3. Serialize model and metric data into joblib file
4. Automatically execute training script during Docker build; no dependency on local pre-generated model files

### 3.5 Task 1 Deliverables
1. Independent subfolder with complete source code
2. Standalone Dockerfile for container build
3. `requirements.txt` dependency lock file
4. Module README with Swagger operation guide

---

## 4. Task 2: Unified Next.js Multi-Backend Portal
### 4.1 Architecture Definition
Single Next.js App Router application with shared global layout, containing two isolated business sub-applications:
- App1: Property Price Submission (Python FastAPI backend)
- App2: Property Market Analysis & What-If Simulation (Java SpringBoot backend)

### 4.2 Global Frontend Mandatory Rules
#### 4.2.1 Routing & Component Specification
1. Adopt Next.js App Router file-system routing
2. Strict separation of Server Components and Client Components
    - Server Component: Static layout, non-interactive rendering, static pre-fetch data
    - Client Component: Forms, filters, sliders, dynamic API requests (must declare `"use client"`)
3. Standardized data fetch strategy: server-side static prefetch + client-side on-demand dynamic fetch

#### 4.2.2 Global Loading & Error Handling (Layout Level Requirement)
1. Unified global loading state managed by root layout React Context
2. Global Error Boundary to capture unhandled runtime exceptions and API errors
3. Reusable global error alert component shared by two sub-applications

#### 4.2.3 UI/UX Mandatory Requirements
1. Fully responsive layout implemented by Tailwind CSS, compatible with mobile, tablet and desktop
2. WCAG accessibility compliance: semantic HTML, sufficient color contrast, keyboard navigation, ARIA labels
3. Reusable shared UI component library: input, button, card, skeleton loader, alert
4. Consistent unified design language across App1 and App2

#### 4.2.4 State Management
1. Local client state via `useState` / `useContext` for form inputs, filter selections, what-if feature values
2. Centralized unified fetch utility for all requests to Python and Java backends
3. Isolated state scope for two sub-applications to avoid state pollution

### 4.3 Sub-App 1: Property Submission (Python FastAPI Backend)
#### 4.3.1 Frontend Functions
1. Complete housing feature input form consistent with ML model feature schema
2. Client-side form validation
3. Result panel to display predicted housing price after submission
4. Reuse global loading & error components

#### 4.3.2 Python Backend Functions
1. REST endpoint to receive form payload from Next.js frontend
2. Input sanitization and parameter validation
3. Internal HTTP client to call Task1 ML `/predict` API
4. Wrap upstream ML service exceptions into unified readable error response

#### 4.3.3 Tech Constraints
Python 3.12+, FastAPI

### 4.4 Sub-App 2: Market Analysis & What-If Simulation (Java Backend)
#### 4.4.1 Frontend Functions
1. Multi-dimensional filter panel for property market segmentation
2. Interactive What-if simulation tool: adjustable sliders and number inputs for housing features
3. Real-time price recalculation after every feature modification
4. Visual display of market segment statistics

#### 4.4.2 Java Backend Functions
1. REST APIs for market segment statistical aggregation
2. Encapsulate What-if simulation calculation logic
3. HTTP client to remotely invoke Task1 ML prediction service
4. Handle ML service timeout, connection failure and parameter validation errors

#### 4.4.3 Tech Constraints
Java 21, Spring Boot 3.4.4

### 4.5 Heterogeneous Backend Integration Rule
1. Split API encapsulation into independent TS modules: `pythonApi.ts` / `javaApi.ts`
2. All backend base URLs injected via environment variables; hard-coded IP/port is forbidden
3. Configure Next.js rewrite proxy to resolve browser cross-origin issues in local development

### 4.6 Task 2 Deliverables
1. Full Next.js frontend source code
2. Independent Python backend source code with Dockerfile
3. Independent Java SpringBoot source code with Dockerfile
4. Dependency lock files: `package-lock.json`, `requirements.txt`, `pom.xml`
5. Independent README document for each sub-project

---

## 5. Global Non-Functional Requirements
1. **Reproducibility**: Evaluator can start the full system via single docker compose command without manual installation of Python/JDK/Node.
2. **Configuration Management**: All service addresses, ports and third-party URLs defined by environment variables; hardcoding prohibited.
3. **Unified Error Schema**: Consistent JSON error response format across ML service, Python backend and Java backend for unified frontend parsing.
4. **Code Modularity**: Separate layers for routing, business logic, data model and utility functions; monolithic single-file implementation forbidden.
5. **Self-contained Image**: All business code, dataset and training logic copied into Docker image via `COPY` in Dockerfile; volume bind mount is not allowed in release configuration.

---

## 6. Containerization & Deployment Specification
### 6.1 Dockerfile Standard
Four services maintain independent Dockerfile under their own subfolders:
1. ML service: Base image `python:3.12-slim`, execute `train.py` during build phase
2. Python backend: Base image `python:3.12-slim`
3. Java backend: Base image `eclipse-temurin:21-jdk`
4. Next.js frontend: Base image `node:20-alpine`

### 6.2 Docker Compose Orchestration Rule
1. Root-level `docker-compose.yml` as unified entry for all service management
2. Automatically create shared bridge network for inter-container communication
3. Use container service name as internal domain to access dependent services (e.g. `http://ml-service:8000`)
4. Configure `depends_on` to ensure ML service starts before two business backends
5. Distinct host port mapping for each service to avoid port conflict
6. No volume bind mount configured in release compose file

### 6.3 Standard Deployment Commands
Full build & start system:
```bash
docker compose up --build
```
Stop and clean all containers:
```bash
docker compose down
```

### 6.4 Evaluator Reproducibility Standard
After git clone source code, evaluator only needs Docker + Docker Compose installed locally to launch full system without extra environment setup.

---

## 7. Source Code Delivery & Directory Standard
### 7.1 Repository Root Structure
```
housing-price-fullstack/
├── docker-compose.yml
├── README.md
├── .gitignore
├── .env.example
├── ml-service/
├── backend-python/
├── backend-java/
└── nextjs-portal/
```

### 7.2 Delivery Rules
1. Full source code pushed to public GitHub repository
2. Each subfolder contains independent Dockerfile, dependency file and module README
3. `housing.csv` dataset committed to ml-service folder for automatic model training during image build
4. Ignore local runtime artifacts via `.gitignore`: virtual env, node_modules, model cache, build output files

---

## 8. Interview Demo Verification Checklist
### 8.1 Task1 ML Service Demo
- Access Swagger UI `/docs`
- Execute health check request
- Test single & batch predict interface
- Call `/model-info` to view coefficients and regression metrics

### 8.2 App1 Python Backend + Frontend Demo
- Navigate to property submission page
- Fill form and submit, display predicted price result
- Input invalid data to verify global error UI

### 8.3 App2 Java Backend + Frontend Demo
- Apply multi-condition market filters
- Adjust What-if feature sliders to view real-time price change

### 8.4 Exception State Demo
- Verify error prompt for invalid feature input
- Verify loading state and fallback UI when upstream service unavailable

---

## 9. Glossary
| Abbreviation | Full Name | Description |
| ---- | ---- | ---- |
| TRD | Technical Requirement Document | Technical requirement specification document |
| ML | Machine Learning | Machine learning model inference service |
| WCAG | Web Content Accessibility Guidelines | Web accessibility standard |
| App Router | Next.js App Router | Next.js file-based routing system |
| OpenAPI | OpenAPI Specification | API interactive documentation standard (Swagger) |
| Heterogeneous Backend | Heterogeneous Backend | Backend services developed with different tech stacks (Python + Java) |
| What-if Simulation | What-if Simulation | Dynamic feature adjustment price prediction tool |
| NFR | Non-Functional Requirement | Non-business technical constraint |
| Docker Compose | Docker Compose | Multi-container service orchestration tool |