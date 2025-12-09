import { useState } from "react";
import { Link } from "react-router-dom";
import { FloristLayout } from "@/components/bloomfundr/FloristLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchInput } from "@/components/ui/search-input";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
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
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { ShoppingCart, Eye, CheckCircle } from "lucide-react";
import { format, isWithinInterval } from "date-fns";
import type { FulfillmentStatus, BFOrderWithRelations } from "@/types/bloomfundr";

type StatusTab = "all" | "pending" | "in_production" | "ready";

export default function FloristOrdersPage() {
  const { getFilter, getDateRangeFilter, setFilter, setDateRangeFilter } = useUrlFilters({
    defaultValues: { campaign: "all", status: "all" },
  });

  const search = getFilter("search");
  const selectedCampaign = getFilter("campaign") || "all";
  const statusTab = (getFilter("status") || "all") as StatusTab;
  const dateRange = getDateRangeFilter("date");

  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const { data: campaigns } = useFloristCampaignsForFilter();
  const { data: allOrders, isLoading } = useFloristOrdersList(
    selectedCampaign === "all" ? undefined : selectedCampaign,
    statusTab === "all" ? undefined : statusTab as FulfillmentStatus
  );
  const bulkUpdate = useBulkUpdateOrderStatus();

  // Apply client-side filtering
  const orders = allOrders?.filter((order) => {
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        order.order_number.toLowerCase().includes(searchLower) ||
        order.customer?.full_name?.toLowerCase().includes(searchLower) ||
        order.customer?.email?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Date range filter
    if (dateRange?.from) {
      const orderDate = new Date(order.created_at);
      const to = dateRange.to || dateRange.from;
      if (!isWithinInterval(orderDate, { start: dateRange.from, end: to })) {
        return false;
      }
    }

    return true;
  });

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
            <PrintableOrderList orders={orders as BFOrderWithRelations[]} campaignName={selectedCampaignName} />
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput
              value={search}
              onChange={(v) => setFilter("search", v)}
              placeholder="Search by order #, customer..."
              className="flex-1 max-w-sm"
            />
            <Select value={selectedCampaign} onValueChange={(v) => setFilter("campaign", v)}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="All Campaigns" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Campaigns</SelectItem>
                {campaigns?.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DateRangeFilter
              value={dateRange}
              onChange={(v) => setDateRangeFilter("date", v)}
              placeholder="Filter by date"
              className="w-full sm:w-auto"
            />
          </div>

          <Tabs value={statusTab} onValueChange={(v) => setFilter("status", v)}>
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
              <div className="overflow-x-auto">
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
                      <TableHead className="hidden md:table-cell">Campaign</TableHead>
                      <TableHead className="text-center hidden sm:table-cell">Items</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Date</TableHead>
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
                        <TableCell className="hidden md:table-cell">{order.campaign?.name || "Unknown"}</TableCell>
                        <TableCell className="text-center hidden sm:table-cell">
                          {order.order_items?.reduce((sum, i) => sum + i.quantity, 0) || 0}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${Number(order.total).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <OrderFulfillmentBadge status={order.fulfillment_status} />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
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
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">
                  {search || dateRange ? "No orders match your filters" : "No orders yet"}
                </p>
                <p className="text-sm mt-1">
                  {search || dateRange
                    ? "Try adjusting your search or date range"
                    : "Orders will appear here when customers purchase from your campaigns"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </FloristLayout>
  );
}
