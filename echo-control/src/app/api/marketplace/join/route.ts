import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { AppRole, MembershipStatus } from '@/lib/permissions/types';

// POST /api/marketplace/join - Join an app from the marketplace
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { appId } = await request.json();

    if (!appId) {
      return NextResponse.json(
        { error: 'App ID is required' },
        { status: 400 }
      );
    }

    // Verify the app exists and is active
    const app = await db.echoApp.findFirst({
      where: {
        id: appId,
        isActive: true,
        isArchived: false,
      },
    });

    if (!app) {
      return NextResponse.json(
        { error: 'App not found or inactive' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMembership = await db.appMembership.findFirst({
      where: {
        userId: user.id,
        echoAppId: appId,
        isArchived: false,
      },
    });

    if (existingMembership) {
      // If membership exists but is inactive, reactivate it
      if (existingMembership.status !== MembershipStatus.ACTIVE) {
        const updatedMembership = await db.appMembership.update({
          where: { id: existingMembership.id },
          data: { status: MembershipStatus.ACTIVE },
          include: {
            echoApp: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        });
        return NextResponse.json({
          membership: updatedMembership,
          message: 'Membership reactivated successfully',
        });
      }

      return NextResponse.json({
        membership: existingMembership,
        message: 'You are already a member of this app',
      });
    }

    // Create new customer membership
    const membership = await db.appMembership.create({
      data: {
        userId: user.id,
        echoAppId: appId,
        role: AppRole.CUSTOMER,
        status: MembershipStatus.ACTIVE,
        totalSpent: 0, // Initialize with zero spending
      },
      include: {
        echoApp: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        membership,
        message: 'Successfully joined the app!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error joining app:', error);

    if (
      error instanceof Error &&
      (error.message === 'Not authenticated' ||
        error.message.includes('Invalid'))
    ) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
