# 4-minute interview demo script

## 1. Context — 20 seconds
“I built this after our email exchange because Node.js and Angular were the main gap you identified in my CV. I wanted to show that I can transfer my existing API, database, industrial-data, and deployment experience into this stack.”

## 2. Explain the architecture — 40 seconds
Show the README diagram.

- Angular is the browser client.
- It calls a REST API through `/api`.
- Express handles routing, validation, and errors.
- A JSON file is used only to make the demo zero-setup; in production you would use PostgreSQL/MySQL.
- Docker/Nginx files show how you would package the application.

## 3. Show the user flow — 90 seconds
1. Open the dashboard and point out operational metrics.
2. Filter equipment by `OFFLINE`.
3. Create a work order for “Cooling Cabinet 7”.
4. Show the new work order appearing.
5. Click “Start work”, then “Mark completed”.

## 4. Show two code areas — 60 seconds
Backend: `backend/src/server.js`
- REST routes
- server-side validation
- error middleware

Frontend: `frontend/src/app/services/api.service.ts` and `app.component.ts`
- typed API service
- Angular HttpClient
- signals/computed filtering
- state update after API calls

## 5. Close — 30 seconds
“This is intentionally a small project, because I want to be able to explain every line rather than present something copied or over-engineered. I would not claim that this makes me an experienced Angular developer, but it demonstrates that I can learn the stack quickly and that the underlying software concepts are already familiar to me.”
