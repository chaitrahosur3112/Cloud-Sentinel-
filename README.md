# CloudCost Sentinel

> A multi-tenant cloud cost monitoring and optimization platform with analytics, budgets, alerts, ML-based anomaly detection, forecasting, and automated reporting.

[![CI](https://github.com/chaitrahosur3112/Cloud-Sentinel-/actions/workflows/ci.yml/badge.svg)](https://github.com/chaitrahosur3112/Cloud-Sentinel-/actions/workflows/ci.yml)

---

## 🚀 Overview

**CloudCost Sentinel** is a multi-tenant SaaS platform designed to help organizations monitor and understand their cloud spending.

The platform provides:

- Cloud resource monitoring
- Cost tracking and analytics
- Budget management
- Cost alerts
- ML-based anomaly detection
- Cost forecasting
- PDF, Excel, and CSV reports
- Role-based access control
- Organization-level tenant isolation
- Redis caching
- Docker-based deployment
- Automated CI/CD

The system uses a **TypeScript/Express API** for application and business logic and a separate **Python FastAPI ML service** for machine-learning workloads.

---

## ✨ Features

### 🔐 Authentication & Authorization

- JWT-based authentication
- Secure password hashing
- Role-based access control (RBAC)
- Organization-based tenant isolation
- Protected API routes
- Role-specific permissions

### ☁️ Cloud Cost Monitoring

Track cloud resources and their associated costs.

Supported resource information includes:

- Resource name
- Cloud provider
- Resource type
- Region
- Account
- Monthly cost
- Resource status

### 💰 Budget Management

Create and monitor budgets at different scopes.

The dashboard provides:

- Monthly limits
- Current spending
- Remaining budget
- Budget utilization percentage

### 🚨 Cost Alerts

The alert system helps identify spending conditions that require attention.

Alerts can be associated with:

- Budget thresholds
- Cost anomalies
- Resource spending

### 📊 Analytics

Provides cost analytics and spending information through the web dashboard.

Users can analyze:

- Total spending
- Resource-level costs
- Provider-level costs
- Cost trends
- Budget utilization

### 🤖 Machine Learning

CloudCost Sentinel includes a dedicated Python ML service.

#### Anomaly Detection

Identifies unusual cloud-cost patterns across resources.

#### Cost Forecasting

Generates future cost forecasts based on historical cost data.

The ML service is intentionally separated from the main API to provide a clear service and security boundary.

### 📄 Reporting

Generate reports in multiple formats:

- PDF
- Excel/XLSX
- CSV

Reports contain information such as:

- Organization details
- Budget status
- Cost records
- Total spending
- Resource information

Reports can be securely downloaded through authenticated API requests.

### ⚡ Redis Caching

Redis is used to improve application performance by caching frequently accessed data.

### 🐳 Docker

The application can be containerized using Docker.

The architecture includes separate services for:

- Web application
- API
- ML service
- PostgreSQL
- Redis

### 🔄 CI/CD

GitHub Actions automates:

- API type checking
- API tests
- ML linting
- ML tests
- Web type checking
- Web production builds

Railway is used for cloud deployment.

---

# 🏗️ Architecture

```text
                         ┌─────────────────────┐
                         │      React Web       │
                         │     Vite + TS        │
                         └──────────┬──────────┘
                                    │
                                    │ REST API
                                    ▼
                         ┌─────────────────────┐
                         │    Express API      │
                         │   TypeScript        │
                         │                     │
                         │ Auth / RBAC         │
                         │ Business Logic      │
                         │ Reports             │
                         │ Analytics            │
                         └───────┬───────┬─────┘
                                 │       │
                     ┌───────────┘       └────────────┐
                     ▼                                ▼
             ┌───────────────┐                ┌───────────────┐
             │  PostgreSQL   │                │     Redis     │
             │   + Prisma    │                │    Cache      │
             └───────────────┘                └───────────────┘
                                 │
                                 │ ML requests
                                 ▼
                         ┌─────────────────────┐
                         │   FastAPI ML        │
                         │     Service         │
                         │                     │
                         │ Anomaly Detection   │
                         │ Forecasting         │
                         └─────────────────────┘