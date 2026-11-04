import { NextResponse } from 'next/server';
import { DEMO_USER } from '@/lib/demo/demoData';
import { UserProfile } from '@/types';

/** Demo twin of /api/user */
export async function GET(): Promise<NextResponse<UserProfile>> {
  return NextResponse.json(DEMO_USER);
}
