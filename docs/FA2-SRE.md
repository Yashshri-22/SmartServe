\# SmartServe FA2 - SRE and Observability



\## 1. Service Level Indicator (SLI)



The primary SLI for SmartServe is API availability.



SLI:



Successful API requests / Total API requests × 100



The SmartServe backend API is monitored through Kubernetes and Prometheus.



Example API endpoint:



`/api/ai/analyze`



\## 2. Service Level Objective (SLO)



For the FA2 demonstration environment, the target SLO is:



\- API availability: 99% or higher

\- Kubernetes application pods should remain in Running state

\- Critical deployments should have their required replicas available



The Grafana dashboard is used to observe application and Kubernetes health.



\## 3. Service Level Agreement (SLA)



For this academic project, the SLA is treated as an internal service target rather than a commercial agreement.



Target:



\- SmartServe services should be available during the demonstration/evaluation period.

\- Critical service failures should be detected and recovered as quickly as possible.



\## 4. Monitoring and Observability



SmartServe uses:



\- Prometheus for metrics collection

\- Grafana for visualization

\- kube-state-metrics for Kubernetes object metrics

\- Kubernetes pod and deployment status for infrastructure health

\- Kubernetes logs for application troubleshooting



The Grafana dashboard includes:



\- Kubernetes Pod Count

\- Prometheus Availability

\- Available Deployments



\## 5. Incident Example



\### Incident



The SmartServe AI skills analysis initially failed when accessed through the deployed frontend.



\### Impact



Users could access the frontend, but the AI analysis request was sent to the wrong backend URL.



\### Root Cause



The frontend production configuration used:



`VITE\_BACKEND\_URL=http://localhost:5000`



This caused the browser to attempt to access the backend on the user's local machine instead of through the Kubernetes/Nginx API route.



\### Detection



The issue was detected during application testing through the browser and API request testing.



\### Recovery



The production frontend configuration was changed so that the deployed application uses the `/api` path.



Nginx then proxies:



`/api/` → `backend:5000/api/`



The frontend Docker image was rebuilt and redeployed to Kubernetes.



\### Verification



The AI skills analysis was tested again after deployment and successfully returned detected skills.



\## 6. Incident Prevention



To prevent similar incidents:



\- Keep development and production environment configuration separate.

\- Use `/api` for the deployed production frontend.

\- Run frontend builds as part of the CI/CD pipeline.

\- Test the deployed API after deployment.

\- Monitor Kubernetes application health using Prometheus and Grafana.



\## 7. Recovery and Reliability



The Kubernetes deployment provides automated container restart behavior.



Prometheus continuously collects monitoring metrics, while Grafana provides a dashboard for service health.



The CI/CD pipeline automates:



1\. Source checkout

2\. Backend testing

3\. Frontend build

4\. Docker image build

5\. Kubernetes deployment

6\. Deployment verification



\## 8. Postmortem Summary



\### What happened?



The deployed frontend initially attempted to access the backend through `localhost:5000`.



\### Why did it happen?



The development backend URL was still being used in the production frontend configuration.



\### How was it fixed?



The production configuration was changed to use the Kubernetes/Nginx `/api` route. The frontend image was rebuilt and redeployed.



\### What was learned?



Environment-specific configuration must be validated during the CI/CD process, and deployed application functionality should be verified after every deployment.



\### Preventive action



Future versions should include an automated post-deployment API health/functionality check in the CI/CD pipeline.

