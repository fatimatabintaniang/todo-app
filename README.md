# Todo App

Stack :
- **Frontend** : React (Vite)
- **Backend** : Node.js + [Hono](https://hono.dev) avec documentation Swagger (`@hono/zod-openapi` + `@hono/swagger-ui`)
- **Base de données** : PostgreSQL

> Note : Express et Hono ont le même rôle (routeur HTTP), donc le backend utilise **Hono seul** — c'est la stack recommandée aujourd'hui, plus légère qu'Express et avec une génération Swagger native.

## Structure

```
todo-app/
├── backend/        # API Hono
├── frontend/       # App React
└── docker-compose.yml   # PostgreSQL
```

## 1. Lancer PostgreSQL

```bash
docker compose up -d
```

Cela démarre Postgres sur `localhost:5432` (user: `todo_user`, mdp: `niang@4693`, db: `todo_db`).

## 2. Lancer le backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

- API : http://localhost:3001
- Doc Swagger (UI interactive) : http://localhost:3001/ui
- Spec OpenAPI brute (JSON) : http://localhost:3001/doc

Le backend crée automatiquement la table `todos` au démarrage s'il elle n'existe pas.

## 3. Lancer le frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

- App : http://localhost:5173

## Endpoints de l'API

| Méthode | Route        | Description                          |
|---------|--------------|---------------------------------------|
| GET     | /todos       | Liste toutes les tâches               |
| POST    | /todos       | Crée une tâche (`{ "title": "..." }`) |
| PATCH   | /todos/:id   | Met à jour titre et/ou statut `done`  |
| DELETE  | /todos/:id   | Supprime une tâche                    |

Tous les schémas de requête/réponse sont visibles et testables dans Swagger UI (`/ui`).
