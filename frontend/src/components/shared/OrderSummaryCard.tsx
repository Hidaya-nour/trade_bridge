import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface OrderSummaryProps {
  delivered: number;
  shipped: number;
  processing: number;
  pending: number;
  total: number;
}

export const OrderSummaryCard = ({
  delivered,
  shipped,
  processing,
  pending,
  total,
}: OrderSummaryProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-muted-foreground">Delivered</span>
          </div>
          <span className="text-xs font-medium">{delivered}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span className="text-xs text-muted-foreground">Shipped</span>
          </div>
          <span className="text-xs font-medium">{shipped}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-500"></div>
            <span className="text-xs text-muted-foreground">Processing</span>
          </div>
          <span className="text-xs font-medium">{processing}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gray-500"></div>
            <span className="text-xs text-muted-foreground">Pending</span>
          </div>
          <span className="text-xs font-medium">{pending}</span>
        </div>
        <Separator className="my-2" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">Total Orders</span>
          <span className="text-sm font-bold">{total}</span>
        </div>
      </CardContent>
    </Card>
  );
};
