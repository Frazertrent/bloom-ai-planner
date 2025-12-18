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
// PrintableOrderList hidden for future iteration
import { 
  useFloristOrdersList, 
  useFloristCampaignsForFilter,
  useBulkUpdateOrderStatus,
  useUpdateOrderStatus
} from "@/hooks/useFloristOrders";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { ShoppingCart, Eye, CheckCircle, ChevronDown, ChevronRight, Play, Mail, MessageCircle } from "lucide-react";
import { format, isWithinInterval } from "date-fns";
import type { FulfillmentStatus, BFOrderWithRelations } from "@/types/bloomfundr";
import React from "react";

type StatusTab = "all" | "pending" | "in_production" | "ready" | "picked_up" | "delivered";

export default function FloristOrdersPage() {
  const { getFilter, getDateRangeFilter, setFilter, setDateRangeFilter } = useUrlFilters({
    defaultValues: { campaign: "all", status: "all" },
  });

  const search = getFilter("search");
  const selectedCampaign = getFilter("campaign") || "all";
  const statusTab = (getFilter("status") || "all") as StatusTab;
  const dateRange = getDateRangeFilter("date");

  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleOrderExpanded = (orderId: string) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const { data: campaigns } = useFloristCampaignsForFilter();
  const { data: allOrders, isLoading } = useFloristOrdersList(
    selectedCampaign === "all" ? undefined : selectedCampaign,
    statusTab === "all" ? undefined : statusTab as FulfillmentStatus
  );
  const bulkUpdate = useBulkUpdateOrderStatus();
  const updateStatus = useUpdateOrderStatus();

  // Apply client-side filtering
  const orders = allOrders?.filter((order) => {
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const customerName = order.customer_name || order.customer?.full_name || "";
      const matchesSearch =
        order.order_number.toLowerCase().includes(searchLower) ||
        customerName.toLowerCase().includes(searchLower) ||
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

  const handleBulkMarkInProduction = () => {
    if (selectedOrders.length === 0) return;
    bulkUpdate.mutate({ orderIds: selectedOrders, status: "in_production" });
    setSelectedOrders([]);
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
          {/* PrintableOrderList hidden for future iteration */}
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
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="in_production">In Production</TabsTrigger>
              <TabsTrigger value="ready">Ready</TabsTrigger>
              <TabsTrigger value="picked_up">Picked Up</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 p-4 bg-muted rounded-lg">
            <span className="text-sm font-medium">
              {selectedOrders.length} order{selectedOrders.length > 1 ? "s" : ""} selected
            </span>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={handleBulkMarkInProduction}
              disabled={bulkUpdate.isPending}
            >
              <Play className="h-4 w-4 mr-2" />
              Mark In Production
            </Button>
            <Button 
              size="sm" 
              onClick={handleBulkMarkReady}
              disabled={bulkUpdate.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Ready
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setSelectedOrders([])}
            >
              Clear
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
                      <TableHead className="w-10"></TableHead>
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
                      <React.Fragment key={order.id}>
                        <TableRow 
                          className="cursor-pointer"
                          onClick={() => toggleOrderExpanded(order.id)}
                        >
                          <TableCell className="p-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-10 w-10 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleOrderExpanded(order.id);
                              }}
                            >
                              {expandedOrders.has(order.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox 
                              checked={selectedOrders.includes(order.id)}
                              onCheckedChange={(checked) => handleSelectOrder(order.id, !!checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <Link 
                              to={`/florist/orders/${order.id}`}
                              className="font-medium text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {order.order_number}
                            </Link>
                          </TableCell>
                          <TableCell>{order.customer_name || order.customer?.full_name || "Unknown"}</TableCell>
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
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/florist/orders/${order.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                        {expandedOrders.has(order.id) && (
                          <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableCell colSpan={10} className="py-3 px-4">
                              <div className="pl-10 space-y-3">
                                {/* Organization & Campaign Context */}
                                <div className="flex items-center gap-2 text-sm pb-2 border-b border-border/50">
                                  <span className="text-muted-foreground">
                                    {(order.campaign as any)?.organization?.org_type === 'school' && '🏫'}
                                    {(order.campaign as any)?.organization?.org_type === 'sports' && '⚽'}
                                    {(order.campaign as any)?.organization?.org_type === 'dance' && '💃'}
                                    {(order.campaign as any)?.organization?.org_type === 'cheer' && '📣'}
                                    {(order.campaign as any)?.organization?.org_type === 'church' && '⛪'}
                                    {!['school', 'sports', 'dance', 'cheer', 'church'].includes((order.campaign as any)?.organization?.org_type) && '🏢'}
                                  </span>
                                  <span className="font-semibold">
                                    {(order.campaign as any)?.organization?.name || 'Unknown Organization'}
                                  </span>
                                  <span className="text-muted-foreground">—</span>
                                  <span className="text-muted-foreground">
                                    {order.campaign?.name || 'Unknown Campaign'}
                                  </span>
                                </div>

                                {/* Products Section */}
                                {order.order_items && order.order_items.length > 0 && (
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground mb-2">Products:</p>
                                    {order.order_items.map((item, idx) => (
                                      <div key={idx} className="flex items-center gap-2 text-sm">
                                        <span className="text-muted-foreground">•</span>
                                        <span className="font-medium">
                                          {item.campaign_product?.product?.name || "Unknown Product"}
                                        </span>
                                        <span className="text-muted-foreground">×</span>
                                        <span className="font-semibold">{item.quantity}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {/* Quick Actions Section */}
                                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
                                  {/* Status Actions */}
                                  {order.fulfillment_status === "pending" && (
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      className="min-h-[44px]"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateStatus.mutate({ orderId: order.id, status: "in_production" });
                                      }}
                                      disabled={updateStatus.isPending}
                                    >
                                      <Play className="h-4 w-4 mr-2" />
                                      Mark In Production
                                    </Button>
                                  )}
                                  {order.fulfillment_status === "in_production" && (
                                    <Button
                                      size="sm"
                                      className="min-h-[44px]"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateStatus.mutate({ orderId: order.id, status: "ready" });
                                      }}
                                      disabled={updateStatus.isPending}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Mark Ready
                                    </Button>
                                  )}
                                  {order.fulfillment_status === "ready" && (
                                    <span className="text-sm text-muted-foreground px-2">
                                      Awaiting Seller Pickup
                                    </span>
                                  )}
                                  {order.fulfillment_status === "picked_up" && (
                                    <span className="text-sm text-emerald-600 font-medium px-2">
                                      ✓ Complete
                                    </span>
                                  )}
                                  
                                  {/* Contact Actions */}
                                  {(order.customer?.email || order.customer?.phone) && (
                                    <div className="flex items-center gap-1 ml-auto">
                                      {order.customer?.email && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="min-h-[44px] px-3"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.location.href = `mailto:${order.customer?.email}?subject=Order ${order.order_number}`;
                                          }}
                                        >
                                          <Mail className="h-4 w-4" />
                                        </Button>
                                      )}
                                      {order.customer?.phone && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="min-h-[44px] px-3"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.location.href = `sms:${order.customer?.phone}`;
                                          }}
                                        >
                                          <MessageCircle className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
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
