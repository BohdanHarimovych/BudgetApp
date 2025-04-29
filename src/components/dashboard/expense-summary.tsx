"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExpenseSummary() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Total Expenses</span>
            <span className="font-semibold">$0.00</span>
          </div>
          <div className="flex justify-between">
            <span>This Month</span>
            <span className="font-semibold">$0.00</span>
          </div>
          <div className="flex justify-between">
            <span>This Week</span>
            <span className="font-semibold">$0.00</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 