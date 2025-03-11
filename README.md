# PPE24-P-347: Auto-Evaluation Platform

## Overview
A modern web-based auto-evaluation platform built with Next.js 14, React, and Supabase. The platform provides a user-friendly interface for students to track their course progress and upcoming assignments.

## Features
- 🔐 Secure Authentication with Supabase
- 📊 Interactive Course Progress Dashboard
- 🎠 Carousel View of Current Modules
- 📅 Upcoming Assignments Tracker
- 👤 User Profile Information
- 🎨 Modern UI with Tailwind CSS

## Project Structure
```
projet-autoevaluation/
├── app/                    # Next.js application directory
│   ├── dashboard/         # Protected dashboard route
│   │   └── page.tsx      # Main dashboard component
│   ├── login/            # Authentication routes
│   │   └── page.tsx      # Login page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Root page (handles redirects)
├── lib/                   # Shared utilities
│   ├── context/          # React context providers
│   └── supabase/         # Supabase client configuration
├── styles/               # Global styles
└── configuration files   # Various config files
```

## Technology Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase
- **Development Tools**: 
  - ESLint
  - TypeScript
  - PostCSS
  - Autoprefixer

## Getting Started

### Prerequisites
- Node.js (v18 or newer)
- npm or yarn package manager
- Supabase account and project

### Environment Setup
1. Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation
1. Clone the repository:
```bash
git clone https://github.com/IreneJolly/PPE24-P-347.git
cd PPE24-P-347
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features in Detail

### Authentication
- Secure login system using Supabase Auth
- Protected routes with middleware
- Automatic redirects for authenticated/unauthenticated users

### Dashboard
- Welcome section with user information
- Interactive course modules carousel
- Progress tracking for each module
- Upcoming assignments list with due dates
- Responsive design for all screen sizes

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Styling
The project uses Tailwind CSS for styling with a custom configuration. Global styles are defined in `styles/globals.css`.


## License
This project is private and proprietary.

## Contact
Project Link: [https://github.com/IreneJolly/PPE24-P-347](https://github.com/IreneJolly/PPE24-P-347)