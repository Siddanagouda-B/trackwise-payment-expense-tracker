# TrackWise – Payment & Expense Tracker

A full-stack personal finance portfolio project built with React, Java 17, Spring Boot, Spring Data JPA, REST APIs and H2.

## Features
- Personal finance dashboard with income, expenses and net cash flow
- Add, edit and delete income/expense transactions
- Categories, dates, notes and payment methods
- Search transactions and filter by income/expense
- Spending breakdown by category
- Persistent local H2 file database
- Responsive dashboard layout

## Technology
- Frontend: React 18, JavaScript, Vite, HTML5, CSS3, Lucide icons
- Backend: Java 17, Spring Boot 3.4.4, Spring Web, Spring Data JPA, Bean Validation
- Database: H2 file database
- Build tools: Maven and npm

## Requirements
- JDK 17
- Apache Maven 3.8+
- Node.js and npm

## Run the backend
Open PowerShell in this project root (the folder containing `pom.xml`):

```powershell
mvn spring-boot:run
```

Backend: http://localhost:8081  
Health check: http://localhost:8081/api/health  
H2 console: http://localhost:8081/h2-console

H2 console JDBC URL: `jdbc:h2:file:./data/trackwise`  
Username: `sa`  
Password: leave blank

## Run the frontend
Open a second terminal:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open the Vite URL shown in the terminal, usually http://localhost:5173.

## API endpoints
- `GET /api/health`
- `GET /api/overview`
- `GET /api/transactions`
- `POST /api/transactions`
- `PUT /api/transactions/{id}`
- `DELETE /api/transactions/{id}`

Example request body:

```json
{
  "title": "Coffee",
  "category": "Food & dining",
  "type": "EXPENSE",
  "amount": 180.00,
  "transactionDate": "2026-11-24",
  "note": "Coffee with friends",
  "paymentMethod": "UPI"
}
```

## Notes
- The backend runs on port 8081 so it can coexist with the Northstar backend on port 8080.
- The frontend uses the same Vite default port (5173). If Northstar is still running on that port, Vite will automatically choose the next available port and print it in the terminal.
- This is a learning/demo portfolio application, not a real payment processor or banking service. It does not connect to bank accounts or move real money.
- Demo records are inserted on first database creation.
