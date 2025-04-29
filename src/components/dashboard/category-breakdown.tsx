"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CategoryBreakdown() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center p-8">
          <p className="text-muted-foreground">No categories to display</p>
        </div>
      </CardContent>
    </Card>
  );
} 