# taskmanagerapp
# TaskManagerApp

## Description
TaskApp is a cross-platform productivity app built with Expo and Supabase. It enables users to sign up, log in, and manage their personal to-do lists in real time. It features secure authentication, dynamic theming, calendar integration, and a clean, responsive interface optimized for mobile users.

## Tech Stack
- **Backend**: Supabase (PostgreSQL + Auth)
- **Frontend**: React Native (Expo)
- **Database**: Supabase Postgres
- **Payment**: N/A
- **Other**: React Navigation, Metro Bundler, @react-native-community/datetimepicker
## Features
- Create and log in to your account securely using Supabase Auth
- Switch between login and sign-up flows
- View personalized dashboard and daily task summaries
- Create, view, and delete tasks with priority, description, and due dates
-Mark tasks complete (local UI state)
-Calendar integration for selecting and viewing daily tasks
-Update display name and preferences from settings
=Realtime sync for authenticated users
-Dark Mode toggle with theme persistence
## Installation & Setup

```bash
git clone https://github.com/Eustace4/taskmanagerapp.git
cd taskApp
npm install
npx expo start
```
Ensure your supabaseConfig.js contains your project's SUPABASE_URL and SUPABASE_ANON_KEY.
