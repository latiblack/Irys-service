# Irys Upload Service

A Node.js service for uploading votes and feedback to the Irys network.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Add your Irys private key to `.env`:
```
IRYS_PRIVATE_KEY=your_base_eth_wallet_private_key
```

## Running Locally

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Deploying to Railway

1. Create a new project on Railway
2. Connect your GitHub repository or deploy directly
3. Add environment variable: `IRYS_PRIVATE_KEY`
4. Railway will automatically detect and deploy the Node.js app

## Deploying to Vercel

Note: Create a `vercel.json` file for proper routing:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ]
}
```

Then deploy:
```bash
npm i -g vercel
vercel
```

Add environment variable `IRYS_PRIVATE_KEY` in Vercel dashboard.

## API Endpoints

### Health Check
```
GET /health
```

### Upload Vote
```
POST /api/upload-vote
Content-Type: application/json

{
  "voteData": {
    "id": "uuid",
    "project_id": "uuid",
    "user_id": "uuid",
    "created_at": "timestamp"
  }
}
```

### Upload Feedback
```
POST /api/upload-feedback
Content-Type: application/json

{
  "feedbackData": {
    "id": "uuid",
    "project_id": "uuid",
    "user_id": "uuid",
    "title": "string",
    "created_at": "timestamp"
  }
}
```

## Response Format

Success:
```json
{
  "success": true,
  "irysId": "transaction_id",
  "gatewayUrl": "https://gateway.irys.xyz/transaction_id"
}
```

Error:
```json
{
  "error": "error message"
}
```
