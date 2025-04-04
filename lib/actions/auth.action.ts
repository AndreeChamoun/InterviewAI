'use server';

import { auth, db } from '@/firebase/admin';
import { cookies } from 'next/headers';

const ONE_WEEK = 60 * 60 * 24 * 7 * 1000; // 7 days in milliseconds

export async function signUp(params: SignUpParams) {
  const { uid, email, name } = params;
  try {
    const userRecord = await db.collection('users').doc(uid).get();
    if (userRecord.exists) {
      return {
        success: false,
        message: 'User already exists. Please sign in instead.',
      };
    }
    await db.collection('users').doc(uid).set({
      name,
      email,
    });
    return {
      success: true,
      message: 'User created successfully, please sign in',
    };
  } catch (e: any) {
    console.error('Error creating a user', e);
    if (e.code === 'auth/email-already-exists') {
      return {
        success: false,
        message: 'Email is already in use',
      };
    }
    return {
      success: false,
      message: 'Failed to create an account',
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord) {
      return {
        success: false,
        message: 'User does not exist. Please sign up',
      };
    }
    await setSessionCookie(idToken);
  } catch (e) {
    console.log(e);
    return {
      success: false,
      message: 'Failed to sign in',
    };
  }
}
export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  const SessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: ONE_WEEK * 1000, // 7 days
  });

  cookieStore.set('session', SessionCookie, {
    maxAge: ONE_WEEK,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const SessionCookie = cookieStore.get('session')?.value;
  if (!SessionCookie) {
    return null;
  }

  try {
    const decodedClaims = await auth.verifySessionCookie(
      SessionCookie,
      true
    );
    const userRecord = await db
      .collection('users')
      .doc(decodedClaims.uid)
      .get();

    if (!userRecord.exists) {
      return null;
    }
    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (e) {
    console.log(e);
    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
