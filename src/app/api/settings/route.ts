import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenInfo } from '@/lib/meta';

export async function GET() {
  try {
    const info = await getTokenInfo();
    return NextResponse.json(info);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Save to database
    await prisma.setting.upsert({
      where: { key: 'META_PAGE_ACCESS_TOKEN' },
      update: { value: token },
      create: { key: 'META_PAGE_ACCESS_TOKEN', value: token }
    });

    // Verify after saving
    const info = await getTokenInfo();
    return NextResponse.json({ success: true, info });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update settings' },
      { status: 500 }
    );
  }
}
