# Slack Connect

Slack Connect is a full-stack application that enables users to connect their Slack workspace via OAuth 2.0, send messages immediately, and schedule messages for future delivery. This app demonstrates secure token management, scheduled task handling, and seamless Slack integration.

## 🚀 Live Demo & Source Code

- **Frontend (Next.js + Tailwind CSS)**

  GitHub: [freak3123/slack-connect](freak3123/slack-connect)

  Live: [https://slack-connect-silk.vercel.app/](https://slack-connect-silk.vercel.app/)

- **Backend (Node.js + Express + MongoDB)**

  GitHub: [freak3123/slack-connect-backend](freak3123/slack-connect-backend)

  Live: [https://slack-connect-backend-1.onrender.com](https://slack-connect-backend-1.onrender.com)

## 📦 Setup Instructions

### Prerequisites

- Node.js (v16 or later recommended)
- MongoDB (local or hosted instance)
- Slack App created in [Slack API Dashboard](https://api.slack.com/apps)
  - Make sure OAuth scopes and redirect URLs are properly configured
  - Enable token rotation if needed
- Environment variables configured (see below)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Freak3123/slack-connect-backend.git
   cd freak3123-slack-connect-backend
   ```

2. **Install dependencies**
   ```bash
   npm install

   ```
   
3. **Configure environment variables**
   Create a `.env` file in the root directory with the following variables:
   
   ```bash
   PORT=3001
   MONGO_URI=your_mongodb_connection_string
   SLACK_CLIENT_ID=your_slack_app_client_id
   SLACK_CLIENT_SECRET=your_slack_app_client_secret
   SLACK_STATE_SECRET=my_state_secret
   SLACK_SIGNING_SECRET=my_signing_secret
   FRONTEND_URL=https://slack-connect-silk.vercel.app
   SLACK_REDIRECT_URI=https://slack-connect-backend-1.onrender.com/slack/oauth/callback
   ```

4. **Run the backend server**
   ```bash
   npm run dev
   ```

## Important Notes

- **Token Security:**  
  Access and refresh tokens are securely stored in MongoDB. Tokens are automatically refreshed using Slack's OAuth token rotation best practices.

- **Scheduled Messages:**  
  Scheduled tasks use Slack's official scheduled messages API, ensuring messages are delivered reliably at the requested time.

- **Error Handling:**  
  All APIs return meaningful HTTP status codes and error messages. Logs are printed to the console for debugging.

- **Extensibility:**  
  The modular route structure allows easy addition of new Slack API features or other integrations.

- **Session Management:**  
  If you implement user sessions or authentication, ensure secure cookie handling and session expiration.

- **Deployment & Redirect URLs:**  
  Slack OAuth Redirect URLs **do not support `http://` on localhost**.  
  This means the OAuth flow **will not work properly when running locally over `http://localhost`**.  
  To test OAuth locally, you need to use a tool like [ngrok](https://ngrok.com/) or set up HTTPS with a self-signed certificate.  
  Make sure your Slack App’s Redirect URLs are updated accordingly.

- **Deployment:**  
  When deploying, set environment variables securely in your hosting platform and configure network access to MongoDB.



## Architectural Overview

This backend is built with Express.js and TypeScript to serve as the server-side component for the Slack integration app. It provides RESTful APIs to handle Slack OAuth authentication, token management, messaging, and scheduling.

### Directory Structure Highlights

``` bash
freak3123-slack-connect-backend/     
├── app.ts                           #The main application entrypoint that configures Express, connects to the database, and mounts API routes.
├── package.json                     
├── tsconfig.json                    
├── lib/                             
│ ├── dbConnect.ts                   # The main application entrypoint that configures Express, connects to the database, and mounts API routes.
│ └── tokenValidity.ts               # Utility functions to check and refresh Slack OAuth tokens for maintaining valid access.
├── models/                          
│ └── SlackInstallation.ts           # Mongoose schema/model representing Slack workspace installations, storing tokens and team information securely.
└── routes/                          # Contains all Express route handlers that implement the core API functionality:
├── deleter.ts                       # Deletes scheduled Slack messages.
├── directmsg.ts                     # Sends direct Slack messages using stored tokens.
├── getMessages.ts                   # Retrieves message history and scheduled messages from Slack.
├── getTeams.ts                      # Lists all Slack teams where the app is installed.
├── install.ts                       # Handles Slack OAuth installation flow, exchanging codes for tokens and storing installation data.
├── logout.ts                        # Handles user logout and session termination.
├── recipient.ts                     # Provides recipient information for messaging.
├── scheduler.ts                     # Schedules messages for future delivery leveraging Slack’s scheduled messages API.
└── validate.ts                      # Performs token validation and other middleware functions.
```

### OAuth and Token Management

- The app uses Slack’s OAuth v2 flow implemented in `install.ts` to authorize workspaces.
- Access tokens, refresh tokens, and token expiry timestamps are securely stored in MongoDB via the `SlackInstallation` model.
- Token validity is checked using utilities in tokenValidity.ts and tokens are refreshed proactively if expired.
- Each API request that interacts with Slack uses tokens from the database associated with the relevant workspace (`teamId`).
- The system supports token rotation and refresh mechanisms as recommended by Slack to enhance security.

### Scheduled Task Handling

- Scheduled messages are managed via the Slack Web API’s scheduled messages endpoints, abstracted in `scheduler.ts`.
- The backend provides endpoints to create, list, and delete scheduled messages for each Slack workspace.
- Scheduled timestamps are handled in Unix epoch format, converted and validated before calling Slack APIs.
- The app maintains synchronization between scheduled tasks in Slack and internal state as needed, ensuring consistency.

This architecture ensures modularity, security, and scalability for managing Slack integrations, OAuth flows, and message scheduling.


