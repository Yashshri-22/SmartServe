# SmartServe
AI that connects skills to service.

## FA1 DevOps Deployment

### Project
SmartServe is an AI-powered platform that connects volunteers with NGOs based on skills and requirements.

### DevOps Goal
Automate infrastructure provisioning, server configuration, and application deployment using Terraform, Ansible, and Docker.

### Workflow
Developer Machine -> Terraform -> AWS EC2 -> Ansible -> Docker -> SmartServe -> Browser

### Tools
- Terraform: provisions the AWS EC2 instance and security group.
- Ansible: configures the Ubuntu server, installs Docker, and deploys SmartServe.
- Docker: containerizes the frontend and backend applications.
- GitHub: stores and versions the deployment configuration.

### AWS Infrastructure
- Region: ap-south-1 (Mumbai)
- EC2: Ubuntu, t3.small
- Security Group: SSH port 22 and HTTP port 80

### Deployment
The SmartServe frontend and backend are deployed using Docker Compose on an AWS EC2 instance. Nginx serves the frontend on port 80 and proxies `/api` requests to the backend container.

### Result
SmartServe was successfully provisioned with Terraform, configured with Ansible, containerized with Docker, and accessed through the EC2 public IP.
