How the project works:

1. AuthForm, layout, lib/firebase and auth.action process: The user enters their username and password in the AuthForm. The form is validated and then the user is redirected to the auth.action, which checks the user's credentials against the database. Firebase Authentication handles user credentials and session persistence. If the credentials are correct, the user is redirected to the layout, which is the main page of the application. If the credentials are incorrect, the user is shown an error message. If the user is not logged in, they are redirected to the AuthForm. If the user is logged in, they are redirected to the layout.

2. Agent, vapi.sdk, general.action process: Starting the Call: The user presses the "Call" button in the Agent component.The handleCall function initializes the call using the vapi SDK.Depending on the interview type (generate or custom questions), the call is started with appropriate parameters (e.g., username, questions). Call Lifecycle: The Agent component listens for call lifecycle events (call-start, call-end, message, etc.) using the vapi SDK.Incoming messages (e.g., AI transcripts) are processed and displayed in real-time. Ending the Call: When the user presses "End," the handleDisconnect function stops the call and updates the call status to FINISHED.

3. Agent, general.action process: After the call ends, the handleGenerateFeedback function sends the interview transcript to the backend. The backend processes the transcript and generates feedback. The user is redirected to the feedback page (/interview/[interviewId]/feedback) to view the results.

4. lib/firebase: The backend API handles requests for generating interviews and saving data to Firestore. Example: The POST handler creates a new interview document in Firestore with details like role, type, level, and questions.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
