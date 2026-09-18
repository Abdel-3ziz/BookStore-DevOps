# 📚 BookStore DevOps Project

An end-to-end DevOps project for deploying and monitoring a containerized online BookStore application using Docker, Jenkins, Kubernetes, Helm, Prometheus, Grafana, and Alertmanager.

The project demonstrates a complete DevOps workflow starting from application containerization and CI/CD automation to Kubernetes deployment, security, persistent storage, and monitoring.

---

## 📌 Project Overview

The BookStore application is a simple online bookstore consisting of:

- Frontend application built with Node.js
- Backend REST API built with Node.js
- PostgreSQL database
- Docker containers for application components
- Kubernetes for container orchestration
- Jenkins for CI/CD automation
- Docker Hub as a container image registry
- NGINX Ingress for external access
- Kubernetes RBAC for Jenkins access control
- Helm for monitoring stack deployment
- Prometheus for metrics collection
- Grafana for visualization
- Alertmanager for alert handling
- Node Exporter for system-level metrics
- kube-state-metrics for Kubernetes object/state metrics

---

# 🏗️ Architecture

```text
                         Internet
                            |
                            v
                    +----------------+
                    | NGINX Ingress  |
                    +----------------+
                            |
                            v
                  +---------------------+
                  | Frontend Service    |
                  |     ClusterIP       |
                  +---------------------+
                            |
                            v
                  +---------------------+
                  |   Frontend Pods     |
                  |     2 Replicas       |
                  +---------------------+
                            |
                            v
                  +---------------------+
                  | Backend Service     |
                  |     ClusterIP       |
                  +---------------------+
                            |
                            v
                  +---------------------+
                  |    Backend Pods     |
                  |     2 Replicas       |
                  +---------------------+
                            |
                            v
                  +---------------------+
                  | PostgreSQL Service  |
                  |     ClusterIP       |
                  +---------------------+
                            |
                            v
                  +---------------------+
                  | PostgreSQL Pod      |
                  |    StatefulSet      |
                  +---------------------+
                            |
                            v
                  +---------------------+
                  |        PVC          |
                  | Persistent Storage  |
                  +---------------------+


              Kubernetes Monitoring

        +-----------------------------+
        |         Prometheus           |
        +-----------------------------+
          ^            ^            ^
          |            |            |
          |            |            |
   Node Exporter   kube-state-   Kubernetes /
                   metrics       Infrastructure
                                    
                +---------+
                |         |
                v         v
           +---------+ +-------------+
           | Grafana | | Alertmanager|
           +---------+ +-------------+
```

---

# 🔄 DevOps Workflow

```text
Developer
    |
    v
  GitHub
    |
    v
  Jenkins
    |
    +-------------------+
    |                   |
    v                   v
Build Backend      Build Frontend
    |                   |
    +---------+---------+
              |
              v
       Docker Images
              |
              v
         Docker Hub
              |
              v
         Kubernetes
              |
       +------+------+
       |             |
       v             v
   Application    PostgreSQL
       |
       v
    Ingress
       |
       v
     Users


Kubernetes
     |
     v
 Prometheus
     |
     +---------> Grafana
     |
     +---------> Alertmanager
```

---

# 🧩 Application Components

## Frontend

The frontend is a lightweight Node.js web application.

### Responsibilities

- Displays the available books
- Communicates with the backend API
- Provides a `/health` endpoint
- Uses the backend URL from a Kubernetes ConfigMap

### Port

```text
3000
```

### Docker Image

```text
abdel3ziz/bookstore-frontend
```

---

## Backend

The backend is a Node.js REST API connected to PostgreSQL.

### Responsibilities

- Provides the BookStore API
- Reads book data from PostgreSQL
- Initializes the database
- Seeds initial book data
- Provides health and readiness endpoints

### Port

```text
8080
```

### API Endpoints

```text
GET /api/books
GET /api/info
GET /health
GET /ready
```

### Docker Image

```text
abdel3ziz/bookstore-backend
```

---

## PostgreSQL

PostgreSQL is used as the application's persistent database.

It is deployed using a Kubernetes StatefulSet.

### Database Configuration

```text
Database Name: bookstore
Database User: bookstore_user
Database Password: stored in Kubernetes Secret
```

The database uses a PersistentVolumeClaim (PVC) to preserve data across Pod restarts.

---

# 🐳 Docker

Docker is used to containerize the frontend and backend applications.

Project structure:

```text
backend/
├── Dockerfile
├── package.json
└── server.js

frontend/
├── Dockerfile
└── server.js
```

---

## Run with Docker Compose

Build and start the application:

```bash
docker compose up --build
```

Access the application:

```text
Frontend:
http://localhost:3000

Backend:
http://localhost:8080/api/books
```

Stop the application:

```bash
docker compose down
```

---

# 🔄 CI/CD Pipeline

Jenkins is responsible for automating the application delivery process.

The pipeline performs the following workflow:

```text
GitHub
   |
   v
Checkout
   |
   v
Build Backend
   |
   v
Build Frontend
   |
   v
Build Docker Images
   |
   v
Push Images to Docker Hub
   |
   v
Deploy to Kubernetes
   |
   v
Verify Kubernetes Resources
```

---

## Jenkins Pipeline Stages

### 1. Checkout

Jenkins pulls the latest source code from GitHub.

---

### 2. Build Backend

The backend Docker image is built from the backend Dockerfile.

```text
abdel3ziz/bookstore-backend
```

---

### 3. Build Frontend

The frontend Docker image is built from the frontend Dockerfile.

```text
abdel3ziz/bookstore-frontend
```

---

### 4. Push Images

Jenkins authenticates with Docker Hub using Jenkins Credentials and pushes the generated Docker images.

---

### 5. Deploy to Kubernetes

Jenkins connects to the Kubernetes API and applies the required Kubernetes manifests.

The deployment includes:

- Namespace
- ConfigMap
- Secret
- PersistentVolumeClaim
- PostgreSQL StatefulSet
- PostgreSQL Service
- Backend Deployment
- Backend Service
- Frontend Deployment
- Frontend Service
- Ingress

---

### 6. Verify Deployment

The pipeline verifies the Kubernetes resources using commands such as:

```bash
kubectl get pods -n bookstore
kubectl get services -n bookstore
```

---

# ☸️ Kubernetes

The application is deployed inside a dedicated Kubernetes namespace:

```text
bookstore
```

This keeps the application resources isolated from other workloads.

---

# 📦 Kubernetes Resources

The project uses the following Kubernetes resources.

## Namespace

```text
bookstore
```

Provides logical isolation for the application.

---

## Frontend Deployment

```text
Replicas: 2
```

The frontend Deployment manages two frontend Pods.

Benefits:

- Multiple replicas
- Better availability
- Rolling updates
- Kubernetes self-healing

---

## Backend Deployment

```text
Replicas: 2
```

The backend Deployment manages two backend Pods.

Benefits:

- Multiple replicas
- Better availability
- Load distribution through the Kubernetes Service
- Rolling updates
- Kubernetes self-healing

---

## PostgreSQL StatefulSet

```text
Replicas: 1
```

PostgreSQL is deployed using a StatefulSet because the database requires persistent storage and stable workload identity.

> Note: This project uses one PostgreSQL replica. PostgreSQL high availability is outside the scope of this project.

---

# 🌐 Kubernetes Services

The application uses three internal ClusterIP Services:

```text
frontend-service
backend-service
postgres
```

All application services are internal to the Kubernetes cluster.

### Communication Flow

```text
Frontend Pods
      |
      v
backend-service
      |
      v
Backend Pods
      |
      v
postgres
      |
      v
PostgreSQL Pod
```

The PostgreSQL database is not directly exposed to the Internet.

---

# 🌍 Ingress

NGINX Ingress is used to provide external access to the frontend.

The Ingress routes:

```text
/
```

to:

```text
frontend-service:3000
```

Example local access:

```text
http://localhost
```

when the NGINX Ingress Controller is available and configured for local access.

---

# ⚙️ ConfigMap

Kubernetes ConfigMap is used to store non-sensitive application configuration.

The project uses:

```text
DB_HOST
DB_PORT
DB_NAME
BACKEND_URL
```

Example values:

```text
DB_HOST=postgres
DB_PORT=5432
DB_NAME=bookstore
BACKEND_URL=http://backend-service:8080
```

The application consumes these values as environment variables.

---

# 🔐 Kubernetes Secrets

Sensitive database credentials are stored using a Kubernetes Secret.

The Secret contains:

```text
DB_USER
DB_PASSWORD
```

The Backend and PostgreSQL workloads consume these values through Kubernetes `secretKeyRef`.

The actual Secret file is excluded from Git using `.gitignore`.

A template is provided:

```text
k8s/config/secret.example.yml
```

> ⚠️ Kubernetes Secrets are encoded using Base64 by default. Base64 is encoding, not encryption. In production environments, a dedicated secret-management solution should be considered.

---

# 💾 Persistent Storage

PostgreSQL uses a PersistentVolumeClaim:

```text
bookstore-pvc
```

The PVC is mounted inside the PostgreSQL container at:

```text
/var/lib/postgresql/data
```

This provides persistent storage for PostgreSQL data.

---

# ❤️ Health Checks

The Backend application provides two endpoints used by Kubernetes probes.

## Readiness Probe

```text
/ready
```

The readiness probe checks whether the backend can communicate with PostgreSQL.

If the backend is not ready, Kubernetes removes that Pod from normal Service traffic.

### Purpose

```text
Readiness = Can this Pod receive traffic?
```

---

## Liveness Probe

```text
/health
```

The liveness probe checks whether the backend application is alive.

If the application becomes unhealthy, Kubernetes can restart the container.

### Purpose

```text
Liveness = Is the application alive?
```

---

# 📊 Resource Requests & Limits

CPU and memory requests and limits are configured for the application workloads.

Resources are configured for:

```text
Frontend
Backend
PostgreSQL
```

### Requests

Requests define the amount of CPU and memory Kubernetes reserves for a container.

### Limits

Limits define the maximum CPU and memory a container can consume.

This helps with:

- Resource planning
- Kubernetes scheduling
- Resource control
- Preventing uncontrolled resource consumption

---

# 🔒 Kubernetes RBAC

Jenkins uses a dedicated Kubernetes ServiceAccount:

```text
jenkins-deployer
```

The ServiceAccount is bound to:

```text
jenkins-deployer-role
```

using:

```text
jenkins-deployer-binding
```

The Role is namespace-scoped to:

```text
bookstore
```

This allows Jenkins to manage the required application resources without giving it unnecessary cluster-wide permissions.

---

## RBAC Structure

```text
Jenkins
   |
   v
ServiceAccount
jenkins-deployer
   |
   v
RoleBinding
jenkins-deployer-binding
   |
   v
Role
jenkins-deployer-role
   |
   v
bookstore Namespace
```

---

## RBAC Verification

Example permission check:

```bash
kubectl auth can-i get deployments \
-n bookstore \
--as=system:serviceaccount:bookstore:jenkins-deployer
```

Expected result:

```text
yes
```

The RBAC configuration is namespace-scoped rather than granting Jenkins unrestricted cluster-wide access.

---

# 📈 Monitoring

The Kubernetes monitoring stack is deployed using Helm.

The project uses:

```text
kube-prometheus-stack
```

The monitoring environment includes:

- Prometheus
- Grafana
- Alertmanager
- Node Exporter
- kube-state-metrics

---

# 🔭 Prometheus

Prometheus is responsible for collecting and storing metrics from the Kubernetes environment.

It can be used to monitor:

- Kubernetes nodes
- Pods
- Deployments
- StatefulSets
- Kubernetes resources
- CPU usage
- Memory usage
- Resource utilization
- Infrastructure metrics

---

# 📊 Grafana

Grafana is used to visualize metrics collected by Prometheus.

Dashboards can be used to monitor:

- Kubernetes cluster health
- Node resource usage
- Pod CPU usage
- Pod memory usage
- Workload status
- Kubernetes resource utilization

---

# 🚨 Alertmanager

Alertmanager handles alerts generated by Prometheus.

It provides functionality for:

- Alert routing
- Alert grouping
- Notification management
- Sending alerts to configured notification channels

---

# 🖥️ Node Exporter

Node Exporter provides system-level metrics from Kubernetes nodes.

Examples include:

```text
CPU
Memory
Disk
Filesystem
Network
```

---

# ☸️ kube-state-metrics

kube-state-metrics exposes metrics about Kubernetes objects and their current state.

It provides information about resources such as:

```text
Pods
Deployments
StatefulSets
Services
Namespaces
```

---

# ⎈ Helm

Helm is used to install and manage the Kubernetes monitoring stack.

Add the Prometheus Community repository:

```bash
helm repo add prometheus-community \
https://prometheus-community.github.io/helm-charts
```

Update Helm repositories:

```bash
helm repo update
```

Create the monitoring namespace:

```bash
kubectl create namespace monitoring
```

Install kube-prometheus-stack:

```bash
helm install monitoring \
prometheus-community/kube-prometheus-stack \
-n monitoring
```

Check Helm releases:

```bash
helm list -n monitoring
```

Check monitoring Pods:

```bash
kubectl get pods -n monitoring
```

Check monitoring Services:

```bash
kubectl get svc -n monitoring
```

---

# 📁 Project Structure

```text
BookStore-DevOps/
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── Dockerfile
│   └── server.js
│
├── k8s/
│   │
│   ├── namespace/
│   │   └── namespace.yml
│   │
│   ├── config/
│   │   ├── configmap.yml
│   │   ├── secret.example.yml
│   │   └── secret.yml
│   │
│   ├── database/
│   │   ├── pvc.yml
│   │   ├── statefulset.yml
│   │   └── service.yml
│   │
│   ├── backend/
│   │   ├── deployment.yml
│   │   └── service.yml
│   │
│   ├── frontend/
│   │   ├── deployment.yml
│   │   └── service.yml
│   │
│   ├── ingress/
│   │   └── ingress.yml
│   │
│   └── rbac/
│       ├── role.yml
│       └── rolebinding.yml
│
├── photos/
│
├── docker-compose.yml
├── jenkinsfile
├── .gitignore
└── README.md
```

---

# 🔍 Useful Kubernetes Commands

## Get all application resources

```bash
kubectl get all -n bookstore
```

## Get Pods

```bash
kubectl get pods -n bookstore
```

## Get Services

```bash
kubectl get svc -n bookstore
```

## Get Deployments

```bash
kubectl get deployments -n bookstore
```

## Get StatefulSets

```bash
kubectl get statefulsets -n bookstore
```

## Get PVCs

```bash
kubectl get pvc -n bookstore
```

## Get Ingress

```bash
kubectl get ingress -n bookstore
```

## View Pod logs

```bash
kubectl logs <pod-name> -n bookstore
```

## Describe a Pod

```bash
kubectl describe pod <pod-name> -n bookstore
```

## Check RBAC permissions

```bash
kubectl auth can-i get deployments \
-n bookstore \
--as=system:serviceaccount:bookstore:jenkins-deployer
```

---

# 🔍 Useful Docker Commands

Build backend:

```bash
docker build -t abdel3ziz/bookstore-backend:1.0 ./backend
```

Build frontend:

```bash
docker build -t abdel3ziz/bookstore-frontend:1.0 ./frontend
```

Run backend:

```bash
docker run -p 8080:8080 \
abdel3ziz/bookstore-backend:1.0
```

Run frontend:

```bash
docker run -p 3000:3000 \
abdel3ziz/bookstore-frontend:1.0
```

---

# ☸️ Kubernetes Deployment

After configuring the Kubernetes cluster and required Secret:

```bash
kubectl apply -f k8s/namespace/
```

Apply configuration:

```bash
kubectl apply -f k8s/config/
```

Deploy PostgreSQL:

```bash
kubectl apply -f k8s/database/
```

Deploy Backend:

```bash
kubectl apply -f k8s/backend/
```

Deploy Frontend:

```bash
kubectl apply -f k8s/frontend/
```

Deploy Ingress:

```bash
kubectl apply -f k8s/ingress/
```

Deploy RBAC:

```bash
kubectl apply -f k8s/rbac/
```

Verify the complete application:

```bash
kubectl get all -n bookstore
```

---

# 🧪 Application Testing

## Frontend Health

```text
/health
```

Example:

```text
http://localhost/health
```

---

## Backend Health

```text
/health
```

Example:

```text
http://localhost:8080/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "backend"
}
```

---

## Backend Readiness

```text
/ready
```

The endpoint verifies database connectivity.

Expected response when PostgreSQL is available:

```json
{
  "status": "ready",
  "database": "connected"
}
```

---

## Books API

```text
/api/books
```

Example:

```text
http://localhost:8080/api/books
```

Returns the books stored in PostgreSQL.

---

# 📚 Sample Books

The database is automatically seeded with sample books when it is initialized.

```text
Clean Code
The DevOps Handbook
Kubernetes Up & Running
```

---

# 🔐 Security Considerations

The project applies several Kubernetes security practices:

- Dedicated namespace for the application
- Dedicated ServiceAccount for Jenkins
- Namespace-scoped RBAC
- Kubernetes Secrets for database credentials
- Database Service is internal using ClusterIP
- Actual Secret file excluded from Git
- Resource requests and limits
- Health checks for application workloads

For a production environment, additional security measures could include:

- External secret management
- TLS for Ingress
- NetworkPolicies
- Image vulnerability scanning
- Container security contexts
- Pod Security Standards
- Private container registry
- Centralized logging
- Stronger database security
- Managed Kubernetes and managed database services

---

# 🎯 Project Objectives

This project was built to demonstrate practical DevOps skills including:

- Application containerization
- Docker
- Docker Compose
- Docker Hub
- Jenkins CI/CD
- Kubernetes Deployments
- Kubernetes StatefulSets
- Kubernetes Services
- Kubernetes Ingress
- ConfigMaps
- Secrets
- PersistentVolumeClaims
- Health probes
- Resource requests and limits
- Kubernetes RBAC
- Helm
- Prometheus
- Grafana
- Alertmanager
- Node Exporter
- kube-state-metrics
- Git and GitHub

---

# 🔄 Complete Workflow

```text
                    ┌─────────────┐
                    │   GitHub    │
                    └──────┬──────┘
                           │
                           v
                    ┌─────────────┐
                    │   Jenkins   │
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │             │
                    v             v
              Build Backend  Build Frontend
                    │             │
                    └──────┬──────┘
                           │
                           v
                    ┌─────────────┐
                    │    Docker   │
                    └──────┬──────┘
                           │
                           v
                    ┌─────────────┐
                    │  Docker Hub │
                    └──────┬──────┘
                           │
                           v
                    ┌─────────────┐
                    │ Kubernetes  │
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            v              v              v
        Frontend        Backend       PostgreSQL
            │              │              │
            └──────────────┼──────────────┘
                           │
                           v
                       Ingress
                           │
                           v
                         Users


                     Monitoring
                          │
                          v
                     Prometheus
                     /        \
                    /          \
                   v            v
               Grafana     Alertmanager
```

---

# 🛠️ Technologies

| Category | Technology |
|---|---|
| Application | Node.js |
| Database | PostgreSQL 16 |
| Containerization | Docker |
| Local Orchestration | Docker Compose |
| Container Registry | Docker Hub |
| CI/CD | Jenkins |
| Orchestration | Kubernetes |
| Kubernetes Packaging | Helm |
| Ingress | NGINX Ingress |
| Configuration | ConfigMap |
| Secrets | Kubernetes Secrets |
| Storage | PersistentVolumeClaim |
| Security | Kubernetes RBAC |
| Monitoring | Prometheus |
| Visualization | Grafana |
| Alerting | Alertmanager |
| System Metrics | Node Exporter |
| Kubernetes Metrics | kube-state-metrics |
| Version Control | Git / GitHub |

---

# 📸 Project Screenshots

Screenshots of the project can be found in:

```text
photos/
```

Recommended screenshots include:

- Kubernetes architecture
- Jenkins CI/CD pipeline
- Grafana dashboard
- Prometheus targets and metrics
- Running BookStore application

---

# 📌 Key DevOps Concepts Demonstrated

## CI/CD

```text
GitHub → Jenkins → Docker → Docker Hub → Kubernetes
```

## Kubernetes

```text
Deployments
StatefulSet
Services
Ingress
ConfigMap
Secret
PVC
RBAC
Probes
Resource Requests/Limits
```

## Monitoring

```text
Kubernetes
     |
     +--> Node Exporter
     |
     +--> kube-state-metrics
     |
     v
 Prometheus
     |
     +--> Grafana
     |
     +--> Alertmanager
```

---

# 🚀 Future Improvements

Possible future improvements include:

- Automated application testing in Jenkins
- Jenkins Webhook integration with GitHub
- TLS/HTTPS for Ingress
- NetworkPolicies
- Container image vulnerability scanning
- External Secret Management
- Application-level Prometheus `/metrics`
- Custom Grafana dashboards
- Advanced Prometheus alert rules
- Centralized logging
- Argo CD / GitOps
- Deployment to AWS EKS
- Terraform infrastructure provisioning
- Horizontal Pod Autoscaling

---

# 👨‍💻 Author

## Abdelaziz Hassan

DevOps / Cloud Enthusiast

GitHub:

```text
https://github.com/Abdel-3ziz
```

Project Repository:

```text
https://github.com/Abdel-3ziz/BookStore-DevOps
```

---

# ⭐ Project Summary

This project combines application development and DevOps practices into one complete workflow:

```text
Source Code
     ↓
GitHub
     ↓
Jenkins CI/CD
     ↓
Docker
     ↓
Docker Hub
     ↓
Kubernetes
     ↓
Ingress
     ↓
BookStore Application
     ↓
Prometheus
     ↓
Grafana
     ↓
Alertmanager
```

The main goal of the project is to demonstrate a practical end-to-end DevOps workflow covering containerization, CI/CD, Kubernetes deployment, security, persistent storage, and observability.
