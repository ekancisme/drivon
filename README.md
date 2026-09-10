<div align="center">


[![Typing SVG](https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=700&size=24&duration=2500&pause=650&color=7C3AED&center=true&vCenter=true&repeat=true&width=760&lines=DRIVON+-+Next-Gen+Car+Rental+Platform;Java+17+%2B+Spring+Boot+3+%2B+MongoDB+%2B+React;Real-time+STOMP+Chat+%26+Live+Notifications;Automated+PayOS+Payment+%26+Digital+Contracts;Multi-Role%3A+Customer+%2B+Owner+%2B+Admin)](https://git.io/typing-svg)

[![Live Demo](https://img.shields.io/badge/Live_Demo-youngltc.id.vn-7C3AED?style=for-the-badge&logo=caddy&logoColor=white)](https://youngltc.id.vn)
[![Portfolio](https://img.shields.io/badge/Portfolio-ltcuong24.id.vn-06B6D4?style=for-the-badge&logo=vercel&logoColor=white)](https://ltcuong24.id.vn)
[![Email](https://img.shields.io/badge/Email-lethecuong2k4%40gmail.com-0EA5E9?style=for-the-badge&logo=gmail&logoColor=white)](mailto:lethecuong2k4@gmail.com)
[![GitHub followers](https://img.shields.io/github/followers/ekancisme?style=for-the-badge&logo=github&label=Followers&color=181717)](https://github.com/ekancisme?tab=followers)

</div>

<img align="right" width="380" src="./assets/coding.svg" alt="Animated developer workspace" />

### `> project_spec`

```yaml
project: Drivon (Car Rental & Fleet Management Ecosystem)
author: Lê Thế Cường
role: Full-stack Developer
education: Software Engineering @ FPT University Đà Nẵng
location: Đà Nẵng, Việt Nam
stack:
  backend: Java 17, Spring Boot 3, Spring Security, MongoDB
  frontend: React 18, Tailwind CSS, Lucide Icons, WebSocket STOMP
  integrations: PayOS Payment Gateway, Cloudinary Media, Gmail SMTP
  infrastructure: Docker, Nginx Reverse Proxy, Caddy Auto-HTTPS
live_demo: https://youngltc.id.vn
```

- High-performance vehicle rental and fleet management platform connecting Renters, Car Owners, and Admins.
- Engineered with high-throughput Spring Data MongoDB persistence, sequence generators, and sparse indexing.
- Features real-time bidirectional chat, instant notifications, PayOS QR payments, and digital contract signing.
- Containerized via multi-stage Docker builds and deployed with Caddy automated SSL reverse proxy.

<br clear="both" />

![Animated divider](./assets/divider.svg)

## ⚡ Tech constellation

<div align="center">

[![My Skills](https://skillicons.dev/icons?i=java,spring,react,mongodb,nodejs,docker,nginx,tailwind,html,css,js,git,github,postman&perline=10&theme=dark)](https://skillicons.dev)

![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=081018)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-Real_time-010101?style=flat-square&logo=socketdotio)
![PayOS](https://img.shields.io/badge/PayOS-Payment_Gateway-2563EB?style=flat-square&logo=contactlesspayment&logoColor=white)

</div>

## 🚀 Featured modules

<table>
<tr>
<td width="50%" valign="top">

### 🚗 [Customer Rental Experience](https://youngltc.id.vn)

Smart vehicle search with multi-criteria filters.<br />
Interactive booking engine with instant price estimation.<br />
Seamless PayOS QR banking checkout and digital contracts.

`React 18` `Tailwind` `PayOS`<br />
`MongoDB` `Google OAuth` `Email OTP`

<a href="https://youngltc.id.vn"><img width="100%" src="./assets/renter-card.svg" alt="Drivon customer portal" /></a>

</td>
<td width="50%" valign="top">

### 💼 [Owner Partner & Fleet Portal](https://youngltc.id.vn)

Complete vehicle management and photo uploads.<br />
Live revenue dashboard, profit tracking, and debt calculation.<br />
Withdrawal requests with digital signature validation.

`Spring Boot 3` `Spring Security` `Cloudinary`<br />
`STOMP WebSocket` `Digital Signature` `JWT`

<a href="https://youngltc.id.vn"><img width="100%" src="./assets/partner-card.svg" alt="Drivon partner portal" /></a>

</td>
</tr>
</table>

## 🏆 System Highlights & Capabilities

<div align="center">

![System highlights and capabilities](./assets/achievements.svg)

</div>

<details>
<summary><b>🎯 Core Architecture & Flow Diagram</b></summary>
<br />

```mermaid
graph TD
    Client["Browser / Mobile Client (React 18)"]
    Caddy["Caddy Reverse Proxy (HTTPS / SSL: youngltc.id.vn)"]
    Nginx["Container Nginx Reverse Proxy (Port 80)"]
    SpringBoot["Spring Boot Backend (:8080)"]
    MongoDB[("MongoDB Standalone (drivon_db)")]
    PayOS["PayOS Payment Gateway"]
    Cloudinary["Cloudinary Media API"]
    Gmail["Gmail SMTP Server"]

    Client -->|HTTPS / WSS| Caddy
    Caddy -->|HTTP Proxy| Nginx
    Nginx -->|Static HTML / Bundle| Client
    Nginx -->|/api/* & /ws/*| SpringBoot
    SpringBoot -->|CRUD / Aggregation| MongoDB
    SpringBoot -->|Payment Webhooks| PayOS
    SpringBoot -->|Media Storage| Cloudinary
    SpringBoot -->|Email Verification / OTP| Gmail
```

### Key Architectural Pillars:
1. **Document Database with Sequential IDs:** Custom `SequenceGeneratorService` and `MongoModelListener` ensure safe auto-increment IDs for relational-style entities (Users, Bookings, Contracts, Payments, Reviews).
2. **Stateless Security:** JWT authentication coupled with Google OAuth 2.0 and Spring Security 6 authorization filters.
3. **Real-time Bidirectional Mesh:** WebSocket STOMP message broker handling concurrent peer-to-peer chats and system broadcasts.
4. **Unified Multi-Stage Docker Container:** React production bundle served directly by Nginx with internal reverse proxy to Spring Boot.

</details>

<details>
<summary><b>🛠️ Quick Start & Local Development</b></summary>
<br />

### Prerequisites
- **Java JDK 17+**
- **Node.js 18+** & **npm**
- **MongoDB 6+** (Running locally on `mongodb://localhost:27017` or MongoDB Atlas)

### 1. Backend Setup
```bash
cd backend

# Configure application.properties with your MongoDB URI, JWT Secret, and Gmail SMTP
# Run Spring Boot backend (Starts at http://localhost:8080)
./mvnw clean spring-boot:run
```

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Start React development server (Starts at http://localhost:3000)
npm start
```

</details>

<details>
<summary><b>🚢 Production VPS Deployment</b></summary>
<br />

Deploying Drivon to any Linux VPS using Docker and Caddy:

```powershell
# Run the automated deployment script
.\deploy.ps1 -AppName "drivon-app" -Domain "youngltc.id.vn" -ContainerPort 80
```

The automated pipeline executes:
1. Source packaging excluding dependencies and dev cache.
2. Transferring tarball to remote VPS via SSH/SCP.
3. Building the optimized multi-stage Docker image on the server.
4. Starting `drivon-app` container on the `web-net` Docker network.
5. Updating Caddy reverse proxy routing with zero-downtime SSL certificate reloading.

</details>

<details>
<summary><b>🎮 A Tiny Developer Quest</b></summary>
<br />

```text
MISSION       Deliver robust, scalable, high-performance web experiences
PROJECT       Drivon Car Rental & Fleet Ecosystem
DEVELOPER     Lê Thế Cường (@ekancisme)
TECH POWER    Java 17 · Spring Boot 3 · MongoDB · React · Docker
PARTY MODE    Teamwork · Agile/Scrum · Clean Code · Code Review
NEXT LEVEL    Scalable Distributed Systems & AI Integration
```

</details>

<div align="center">

### 💬 Let's build something memorable

[![Explore Drivon](https://img.shields.io/badge/Explore_Live_Demo-7C3AED?style=for-the-badge&logo=caddy&logoColor=white)](https://youngltc.id.vn)
[![Portfolio](https://img.shields.io/badge/Portfolio-ltcuong24.id.vn-06B6D4?style=for-the-badge&logo=vercel&logoColor=white)](https://ltcuong24.id.vn)
[![Email me](https://img.shields.io/badge/Start_a_conversation-0EA5E9?style=for-the-badge&logo=gmail&logoColor=white)](mailto:lethecuong2k4@gmail.com)

![Animated footer](./assets/footer.svg)

<sub>Designed with code, curiosity and a slightly unreasonable number of animations.</sub>

</div>
