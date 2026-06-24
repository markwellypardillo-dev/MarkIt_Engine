# MarkIt Engine

A comprehensive web-based school management and teacher assistant application built with React, TypeScript, and Tailwind CSS. It is designed to streamline administrative tasks for teachers, such as taking attendance, calculating grades, and managing student rosters.

## Features

- **Dashboard**: Get an overview of your active tasks, upcoming classes, and recent notifications.
- **Attendance & SF2**: Manage daily attendance for your learners. The system is designed to help generate the required SF2 forms.
- **Gradebook & SF9**: Input and compute learners' grades, and manage assignments with ease.
- **Learner Management**: Add, edit, or remove learners in your advisory class. Import student rosters easily via CSV.
- **Reading & Numeracy Profiles**: Record the results of standardized reading and numeracy assessments to track student literacy.
- **Teacher Toolkit**: Access quick utilities such as class randomizers, seating arrangements, and automated lesson planners.
- **Curriculum**: Browse the standard curriculum maps and competency codes aligned with the national framework.
- **Repository**: A digital storage for your lesson plans, modules, and instructional materials.
- **User Management**: Provision and manage teacher and administrator accounts within the institution.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: Supabase Auth (with a local fallback mechanism for testing)
- **Data Parsing**: PapaParse (for CSV learner imports)
- **Backend / Routing**: Express & Node.js

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables by copying the example file:
   ```bash
   cp .env.example .env
   ```
   Add your Supabase URL and Anon Key to the `.env` file if you want to use live authentication.

### Running the Development Server

Start the application in development mode:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

To create a production build:

```bash
npm run build
```

This will bundle the React application and the Express server into the `dist/` directory. You can then start the production server with:

```bash
npm start
```
