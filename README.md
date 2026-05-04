# 🛒 ShopAssist

## What it Does

ShopAssist is a comprehensive AI-powered customer support ecosystem designed for e-commerce. It enables customers to seamlessly track orders, raise support tickets, and interact directly with an intelligent voice agent powered by Bolna.

For the business side, it provides a robust dashboard to monitor support tickets, review AI agent call logs (including transcripts and call summaries), and track overall support statistics. The AI agent is capable of checking order statuses, processing cancellations, providing refund details, and automatically creating support tickets based on customer interactions.

---

## Project Structure & Functionality

### `app/`

The core Next.js App Router directory containing both frontend pages and backend API endpoints.

- **`dashboard/`**: The administrative interface for staff to manage tickets, view call logs, and see analytics.
- **`api/`**: The backend API routes handling all data operations.
  - **`bolna/`**: Webhooks and endpoints specifically for the Bolna AI voice agent integration (caller lookup, initiating calls, and handling post-call webhook data).
  - **`dashboard/`**: APIs providing data for the admin dashboard (call lists and statistics).
  - **`orders/`**: Endpoints for checking order statuses and processing order cancellations.
  - **`refunds/`**: Endpoints for looking up refund statuses.
  - **`subscriptions/`**: Endpoints for managing and cancelling user subscriptions.
  - **`tickets/`**: Endpoints for creating, updating, and fetching support tickets.

### `components/`

Reusable React components organized by their domain.

- **`dashboard/`**: Components specific to the admin dashboard (e.g., Ticket Tables, Call Logs, Detail Sheets, Stat Bars).
- **`portal/`**: Customer-facing components for the main portal (e.g., Order Lookup Forms, Callback Forms).
- **`shared/`**: Common components shared across both the portal and the dashboard.
- **`ui/`**: Foundational UI components (buttons, inputs, dialogs, etc.).

### `lib/`

Core utilities, business logic, and configuration files.

- **Authentication & Context**: Utilities for verifying agent requests and maintaining call contexts.
- **Database Client**: Database initialization for interactions.
- **Business Logic Engines**: Systems for classifying call outcomes and inferring ticket priorities.
- **Mock Data**: Seed data used for development and testing.

### `prisma/`

Database configuration and management.

- **Schema**: Defines the PostgreSQL database structure including Orders, Refunds, Subscriptions, Support Tickets, and Call Logs.
- **Migrations**: Database migration history.
- **Seed Script**: Scripts to populate the database with initial mock data for testing.

### `validator/`

Validation schemas to ensure data integrity across the application using zod.

- Contains strict validation rules for orders, subscriptions, tickets, and Bolna webhooks to ensure all incoming API requests are formatted correctly.

### `types/`

Global type definitions to ensure type safety across the frontend and backend codebase.
