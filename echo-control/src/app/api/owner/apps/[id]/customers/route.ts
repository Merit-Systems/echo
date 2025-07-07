import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { PermissionService } from '@/lib/permissions/service';
import { Permission, AppRole, MembershipStatus } from '@/lib/permissions/types';

// GET /api/owner/apps/[id]/customers - List app customers
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: appId } = await params;
    const user = await getCurrentUser();

    // Check if user has permission to manage customers
    const hasPermission = await PermissionService.hasPermission(
      user.id,
      appId,
      Permission.MANAGE_CUSTOMERS
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Get app customers (including both customers and admins, but not owners)
    const customers = await db.appMembership.findMany({
      where: {
        echoAppId: appId,
        role: { in: [AppRole.CUSTOMER, AppRole.ADMIN] },
        isArchived: false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Error fetching customers:', error);

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

// POST /api/owner/apps/[id]/customers - Add customer to app (for CLI auth flow)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: appId } = await params;
    const user = await getCurrentUser();
    const { userId } = await request.json();

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

    // Allow self-enrollment or owner/admin adding customers
    const targetUserId = userId || user.id;

    // If adding someone else, check permissions
    if (targetUserId !== user.id) {
      const hasPermission = await PermissionService.hasPermission(
        user.id,
        appId,
        Permission.MANAGE_CUSTOMERS
      );

      if (!hasPermission) {
        return NextResponse.json(
          { error: 'Permission denied' },
          { status: 403 }
        );
      }
    }

    // Check if user is already a member
    const existingMembership = await db.appMembership.findFirst({
      where: {
        userId: targetUserId,
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
        });
        return NextResponse.json({ membership: updatedMembership });
      }

      return NextResponse.json({ membership: existingMembership });
    }

    // Create new customer membership
    const membership = await db.appMembership.create({
      data: {
        userId: targetUserId,
        echoAppId: appId,
        role: AppRole.CUSTOMER,
        status: MembershipStatus.ACTIVE,
        totalSpent: 0, // Initialize with zero spending
        freeSpendPoolSpent: 0, // Initialize with zero free pool spending
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({ membership }, { status: 201 });
  } catch (error) {
    console.error('Error adding customer:', error);

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
