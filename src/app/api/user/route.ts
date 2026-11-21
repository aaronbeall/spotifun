import { NextRequest, NextResponse } from 'next/server';
import { getUsername } from '@/lib/session';
import { getUserInfo } from '@/lib/lastfmApi';
import { errorResponse } from '@/lib/apiErrors';
import { UserProfile } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<UserProfile | { error: string }>> {
  try {
    const profile = await getUserInfo(getUsername(request));
    return NextResponse.json({
      id: profile.name.toLowerCase(),
      display_name: profile.realname || profile.name,
      images: [],
      url: profile.url,
      playcount: profile.playcount,
      ...(profile.registeredAt ? { registeredAt: profile.registeredAt } : {}),
    });
  } catch (error) {
    return errorResponse(error, 'user data');
  }
}
