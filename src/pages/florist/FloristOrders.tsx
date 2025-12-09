import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FloristLayout } from "@/components/bloomfundr/FloristLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderFulfillmentBadge } from "@/components/bloomfundr/OrderFulfillmentBadge";
import { PrintableOrderList } from "@/components/bloomfundr/PrintableOrderList";
import { 
  useFloristOrdersList, 
  useFloristCampaignsForFilter,
  useBulkUpdateOrderStatus 
} from "@/hooks/useFloristOrders";
import { ShoppingCart, Eye, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import type { FulfillmentStatus } from "@/types/bloomfundr";

type StatusTab = "all" | "pending" | "in_production" | "ready";

export default function FloristOrdersPage() {
  const [searchParams] = useSearchParams();
  const initialCampaign = searchParams.get("campaign") || "all";
  
  const [selectedCampaign, setSelectedCampaign] = useState(initialCampaign);
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const { data: campaigns } = useFloristCampaignsForFilter();
  const { data: orders, isLoading } = useFloristOrdersList(
    selectedCampaign, 
    statusTab === "all" ? undefined : statusTab as FulfillmentStatus
  );
  const bulkUpdate = useBulkUpdateOrderStatus();

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders((prev) => [...prev, orderId]);
    } else {
      setSelectedOrders((prev) => prev.filter((id) => id !== orderId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && orders) {
      setSelectedOrders(orders.map((o) => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleBulkMarkReady = () => {
    if (selectedOrders.length === 0) return;
    bulkUpdate.mutate({ orderIds: selectedOrders, status: "ready" });
    setSelectedOrders([]);
  };

  const selectedCampaignName = campaigns?.find((c) => c.id === selectedCampaign)?.name;

  return (
    <FloristLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Orders</h1>
            <p className="text-muted-foreground mt-1">
              Manage and fulfill customer orders
            </p>
          </div>
          {orders && orders.length > 0 && (
            <PrintableOrderList orders={orders} campaignName={selectedCampaignName} />
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="All Campaigns" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              {campaigns?.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tabs value={statusTab} onValueChange={(v) => setStatusTab(v as StatusTab)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="in_production">In Production</TabsTrigger>
              <TabsTrigger value="ready">Ready</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <span className="text-sm font-medium">
              {selectedOrders.length} order{selectedOrders.length > 1 ? "s" : ""} selected
            </span>
            <Button 
              size="sm" 
              onClick={handleBulkMarkReady}
              disabled={bulkUpdate.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Selected as Ready
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setSelectedOrders([])}
            >
              Clear Selection
            </Button>
          </div>
        )}

        {/* Orders Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>Orders from your campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : orders && orders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={orders.length > 0 && selectedOrders.length === orders.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedOrders.includes(order.id)}
                          onCheckedChange={(checked) => handleSelectOrder(order.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <Link 
                          to={`/florist/orders/${order.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {order.order_number}
                        </Link>
                      </TableCell>
                      <TableCell>{order.customer?.full_name || "Unknown"}</TableCell>
                      <TableCell>{order.campaign?.name || "Unknown"}</TableCell>
                      <TableCell className="text-center">
                        {order.order_items?.reduce((sum, i) => sum + i.quantity, 0) || 0}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${Number(order.total).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <OrderFulfillmentBadge status={order.fulfillment_status} />
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/florist/orders/${order.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No orders yet</p>
                <p className="text-sm mt-1">
                  Orders will appear here when customers purchase from your campaigns
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </FloristLayout>
  );
}
