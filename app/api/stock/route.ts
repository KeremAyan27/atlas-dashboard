// GET /api/stock?from&to&category&status → product catalog filtered by
// category and stock status, sorted by stock pressure. Stock levels are
// point-in-time (dataset end); the date range only scopes the movement count
// shown in the summary.

import { NextRequest, NextResponse } from "next/server";
import { getProducts, getStockMovements } from "@/lib/data";
import { normalizeRange } from "@/lib/date-range";
import type { StockResponse } from "@/types/atlas";

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const { from, to } = normalizeRange(params.get("from"), params.get("to"));
    const category = params.get("category") || null;
    const status = params.get("status") || "all"; // all | critical | healthy

    const [products, movements] = await Promise.all([
      getProducts(),
      getStockMovements(),
    ]);

    const inCategory = products.filter(
      (p) => !category || p.category === category,
    );
    const isCritical = (p: (typeof products)[number]) =>
      p.stockLevel < p.criticalStock;

    const filtered = inCategory
      .filter((p) =>
        status === "critical"
          ? isCritical(p)
          : status === "healthy"
            ? !isCritical(p)
            : true,
      )
      .sort(
        (a, b) => a.stockLevel / a.criticalStock - b.stockLevel / b.criticalStock,
      );

    // Summary is computed on the category slice (before the status filter)
    // so SKU count and fill rate stay meaningful while viewing "Critical".
    const criticalCount = inCategory.filter(isCritical).length;
    const productIds = new Set(inCategory.map((p) => p.productId));
    const movementsInRange = movements.filter(
      (m) =>
        m.date.slice(0, 10) >= from &&
        m.date.slice(0, 10) <= to &&
        productIds.has(m.productId),
    ).length;

    const body: StockResponse = {
      products: filtered,
      summary: {
        totalSkus: inCategory.length,
        criticalCount,
        fillRatePct:
          inCategory.length > 0
            ? ((inCategory.length - criticalCount) / inCategory.length) * 100
            : 0,
        movementsInRange,
      },
      facets: {
        categories: [...new Set(products.map((p) => p.category))].sort(),
      },
    };
    return NextResponse.json(body);
  } catch {
    return NextResponse.json(
      { error: "Failed to load stock data" },
      { status: 500 },
    );
  }
}
