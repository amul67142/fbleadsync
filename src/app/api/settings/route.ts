import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenInfo } from '@/lib/meta';

export async function GET() {
  try {
    const info = await getTokenInfo();
    
    // Fetch Conversions API settings
    const pixelIdSetting = await prisma.setting.findUnique({ where: { key: 'META_PIXEL_ID' } });
    const capiTokenSetting = await prisma.setting.findUnique({ where: { key: 'META_CONVERSIONS_API_ACCESS_TOKEN' } });
    const testCodeSetting = await prisma.setting.findUnique({ where: { key: 'META_TEST_EVENT_CODE' } });

    const pixelId = pixelIdSetting?.value || process.env.META_PIXEL_ID || null;
    const capiToken = capiTokenSetting?.value || process.env.META_CONVERSIONS_API_ACCESS_TOKEN || null;
    const testCode = testCodeSetting?.value || process.env.META_TEST_EVENT_CODE || null;

    return NextResponse.json({
      ...info,
      capi: {
        pixelId: pixelId || '',
        hasToken: !!capiToken,
        capiTokenMasked: capiToken ? `${capiToken.substring(0, 6)}...${capiToken.substring(capiToken.length - 4)}` : '',
        testCode: testCode || ''
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Check if it's the Conversions API update
    if ('pixelId' in body || 'capiToken' in body || 'testCode' in body) {
      const { pixelId, capiToken, testCode } = body;

      if (pixelId !== undefined) {
        await prisma.setting.upsert({
          where: { key: 'META_PIXEL_ID' },
          update: { value: pixelId.trim() },
          create: { key: 'META_PIXEL_ID', value: pixelId.trim() }
        });
      }

      if (capiToken !== undefined && capiToken.trim() !== '') {
        await prisma.setting.upsert({
          where: { key: 'META_CONVERSIONS_API_ACCESS_TOKEN' },
          update: { value: capiToken.trim() },
          create: { key: 'META_CONVERSIONS_API_ACCESS_TOKEN', value: capiToken.trim() }
        });
      }

      if (testCode !== undefined) {
        await prisma.setting.upsert({
          where: { key: 'META_TEST_EVENT_CODE' },
          update: { value: testCode.trim() },
          create: { key: 'META_TEST_EVENT_CODE', value: testCode.trim() }
        });
      }

      // Fetch fresh states to return
      const info = await getTokenInfo();
      const updatedPixel = await prisma.setting.findUnique({ where: { key: 'META_PIXEL_ID' } });
      const updatedCapiToken = await prisma.setting.findUnique({ where: { key: 'META_CONVERSIONS_API_ACCESS_TOKEN' } });
      const updatedTestCode = await prisma.setting.findUnique({ where: { key: 'META_TEST_EVENT_CODE' } });

      return NextResponse.json({
        success: true,
        info: {
          ...info,
          capi: {
            pixelId: updatedPixel?.value || '',
            hasToken: !!updatedCapiToken?.value,
            capiTokenMasked: updatedCapiToken?.value ? `${updatedCapiToken.value.substring(0, 6)}...${updatedCapiToken.value.substring(updatedCapiToken.value.length - 4)}` : '',
            testCode: updatedTestCode?.value || ''
          }
        }
      });
    }

    // Standard META_PAGE_ACCESS_TOKEN update
    const { token } = body;
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Save to database
    await prisma.setting.upsert({
      where: { key: 'META_PAGE_ACCESS_TOKEN' },
      update: { value: token.trim() },
      create: { key: 'META_PAGE_ACCESS_TOKEN', value: token.trim() }
    });

    // Verify and return after saving
    const info = await getTokenInfo();
    const pixelIdSetting = await prisma.setting.findUnique({ where: { key: 'META_PIXEL_ID' } });
    const capiTokenSetting = await prisma.setting.findUnique({ where: { key: 'META_CONVERSIONS_API_ACCESS_TOKEN' } });
    const testCodeSetting = await prisma.setting.findUnique({ where: { key: 'META_TEST_EVENT_CODE' } });

    return NextResponse.json({
      success: true,
      info: {
        ...info,
        capi: {
          pixelId: pixelIdSetting?.value || '',
          hasToken: !!capiTokenSetting?.value,
          capiTokenMasked: capiTokenSetting?.value ? `${capiTokenSetting.value.substring(0, 6)}...${capiTokenSetting.value.substring(capiTokenSetting.value.length - 4)}` : '',
          testCode: testCodeSetting?.value || ''
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update settings' },
      { status: 500 }
    );
  }
}
