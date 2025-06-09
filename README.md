# Optimum Stay Home - Deployment Guide

This guide explains how to deploy the Optimum Stay Home application to Domain King using GitHub Actions.

## Prerequisites

1. A Domain King hosting account with FTP access
2. GitHub repository with the code pushed to it
3. Firebase project set up with necessary configurations

## GitHub Actions Setup

The repository is configured with a GitHub Actions workflow that automatically deploys the application to Domain King whenever changes are pushed to the main branch.

### Required GitHub Secrets

Add the following secrets to your GitHub repository:

- `FTP_SERVER`: Your Domain King FTP server address
- `FTP_USERNAME`: Your Domain King FTP username
- `FTP_PASSWORD`: Your Domain King FTP password
- `FTP_SERVER_DIR`: The directory on the server where files should be uploaded
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID`: Firebase app ID

## Manual Deployment

If you need to deploy manually:

1. Create a `.env.local` file with all required environment variables (see `.env.example`)
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the application
4. Upload the contents of the `out` directory to your Domain King hosting

## Testing Locally

To test the application locally:

1. Create a `.env.local` file with all required environment variables
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Open `http://localhost:3000` in your browser

## Firebase Configuration

Make sure your Firebase project has the following services enabled:
- Authentication
- Firestore Database
- Storage

The Firestore security rules are included in the `firestore.rules` file.
