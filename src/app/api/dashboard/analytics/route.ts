import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    // 1. Authenticate and get role
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Access token failed" }, { status: 401 });
    }

    const profile = await prisma.profiles.findUnique({
      where: { id: user.id },
    });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const role = profile.role?.toUpperCase() || "USER";
    
    // 2. Build where clause
    let manifestWhere: any = {};
    if (role === "VENDOR") {
      if (!profile.vendor_id) {
         return NextResponse.json({ error: "Vendor ID missing for this user" }, { status: 400 });
      }
      manifestWhere = { vendor_id: profile.vendor_id };
    }

    // 3. Perform Aggregations
    const totalShipments = await prisma.manifests.count({
      where: manifestWhere,
    });

    const openDiscrepancies = await prisma.discrepancies.count({
      where: {
        resolution_status: "pending",
        manifests: manifestWhere,
      },
    });

    const completedBoxesAggregate = await prisma.manifest_items.aggregate({
      _sum: { expected_boxes: true },
      where: {
        manifests: {
          ...manifestWhere,
          status: "COMPLETED",
        },
      },
    });
    const boxesDelivered = completedBoxesAggregate._sum.expected_boxes || 0;

    // Accuracy Rate
    const totalExpectedAggregate = await prisma.manifest_items.aggregate({
      _sum: { expected_qty: true },
      where: { manifests: manifestWhere },
    });
    const totalVarianceAggregate = await prisma.discrepancies.aggregate({
      _sum: { variance: true },
      where: { manifests: manifestWhere },
    });

    const totalExpected = totalExpectedAggregate._sum.expected_qty || 0;
    const totalVariance = totalVarianceAggregate._sum.variance || 0;
    let accuracyRate = "100.0";
    if (totalExpected > 0) {
      accuracyRate = (((totalExpected - totalVariance) / totalExpected) * 100).toFixed(1);
    }

    // Trend Data (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch minimal data for the last 7 days to group in memory
    const recentManifests = await prisma.manifests.findMany({
      where: {
        ...manifestWhere,
        created_at: { gte: sevenDaysAgo },
      },
      orderBy: { created_at: 'asc' },
      select: {
        created_at: true,
        manifest_items: { select: { expected_qty: true } },
        discrepancies: { select: { variance: true } },
      },
    });

    const trendMap: Record<string, { expected: number; variance: number }> = {};
    recentManifests.forEach(m => {
      const dateKey = m.created_at 
        ? new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "Unknown";
      
      if (!trendMap[dateKey]) trendMap[dateKey] = { expected: 0, variance: 0 };
      
      m.manifest_items.forEach(item => {
        trendMap[dateKey].expected += (item.expected_qty || 0);
      });
      m.discrepancies.forEach(disc => {
        trendMap[dateKey].variance += Math.abs(disc.variance || 0);
      });
    });

    const trendData = Object.keys(trendMap).map(date => {
      const { expected, variance } = trendMap[date];
      const val = expected > 0 ? ((expected - variance) / expected) * 100 : 100;
      return { day: date, value: parseFloat(val.toFixed(1)) };
    });

    // Part Stats (Top 5)
    const allItems = await prisma.manifest_items.findMany({
      where: { manifests: manifestWhere },
      include: { parts: true },
    });
    
    const allDiscrepancies = await prisma.discrepancies.findMany({
      where: { manifests: manifestWhere },
      include: { parts: true },
    });

    const partMap: Record<string, { expected: number; variance: number; name: string }> = {};
    
    allItems.forEach(item => {
      if (!item.part_id) return;
      if (!partMap[item.part_id]) {
        partMap[item.part_id] = { expected: 0, variance: 0, name: item.parts?.part_name || "Unknown" };
      }
      partMap[item.part_id].expected += (item.expected_qty || 0);
    });

    allDiscrepancies.forEach(disc => {
      if (!disc.part_id) return;
      if (partMap[disc.part_id]) {
        partMap[disc.part_id].variance += Math.abs(disc.variance || 0);
      }
    });

    const partStats = Object.values(partMap)
      .map(p => ({
        name: p.name.length > 10 ? p.name.substring(0, 10) + "..." : p.name,
        expected: p.expected,
        delivered: p.expected - p.variance
      }))
      .sort((a, b) => b.expected - a.expected)
      .slice(0, 5);

    return NextResponse.json({
      totalShipments,
      openDiscrepancies,
      boxesDelivered,
      accuracyRate,
      trendData,
      partStats
    }, { status: 200 });

  } catch (error: any) {
    console.error("Analytics Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}