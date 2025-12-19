import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Printer } from "lucide-react";
import type { CampaignAnalytics } from "@/hooks/useOrgCampaignAnalytics";
import { format } from "date-fns";

interface PrintCampaignSummaryProps {
  analytics: CampaignAnalytics;
  orderStatusFilter?: string;
}

export function PrintCampaignSummary({ analytics, orderStatusFilter = "all" }: PrintCampaignSummaryProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const filteredOrders = orderStatusFilter === "all"
    ? analytics.orders
    : analytics.orders.filter(o => o.fulfillmentStatus === orderStatusFilter);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Campaign Summary - ${analytics.campaign.name}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
            h1 { font-size: 24px; margin-bottom: 8px; }
            h2 { font-size: 18px; margin-top: 24px; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 4px; }
            .subtitle { color: #666; margin-bottom: 24px; }
            .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
            .stat-box { border: 1px solid #ddd; padding: 12px; border-radius: 4px; }
            .stat-label { font-size: 12px; color: #666; margin-bottom: 4px; }
            .stat-value { font-size: 20px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            th, td { text-align: left; padding: 8px; border: 1px solid #ddd; }
            th { background: #f5f5f5; font-weight: 600; }
            .text-right { text-align: right; }
            .status { padding: 2px 8px; border-radius: 4px; font-size: 12px; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-ready { background: #d1fae5; color: #065f46; }
            .status-picked_up { background: #dbeafe; color: #1e40af; }
            @media print {
              body { padding: 0; }
              h2 { page-break-before: auto; }
              tr { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Printer className="h-4 w-4 mr-2" />
          Print Summary
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Campaign Summary Preview</DialogTitle>
        </DialogHeader>

        <div className="flex justify-end mb-4">
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>

        <div ref={printRef} className="bg-white text-black p-4">
          <h1>{analytics.campaign.name}</h1>
          <p className="subtitle">
            {formatDate(analytics.campaign.start_date)} - {formatDate(analytics.campaign.end_date)} •
            Generated {new Date().toLocaleDateString()}
          </p>

          {/* Stats Overview */}
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-label">Total Orders</div>
              <div className="stat-value">{analytics.stats.totalOrders}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value">{formatCurrency(analytics.stats.totalRevenue)}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Your Earnings</div>
              <div className="stat-value">{formatCurrency(analytics.stats.orgEarnings)}</div>
            </div>
          </div>

          {/* Products Summary */}
          {analytics.products.length > 0 && (
            <>
              <h2>Products Sold</h2>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="text-right">Qty Sold</th>
                    <th className="text-right">Unit Price</th>
                    <th className="text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td className="text-right">{product.quantitySold}</td>
                      <td className="text-right">{formatCurrency(product.retailPrice)}</td>
                      <td className="text-right">{formatCurrency(product.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Sellers Summary */}
          {analytics.students.length > 0 && analytics.trackingMode !== 'none' && (
            <>
              <h2>Seller Performance</h2>
              <table>
                <thead>
                  <tr>
                    <th>Seller</th>
                    <th className="text-right">Orders</th>
                    <th className="text-right">Total Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.students.slice(0, 20).map((student) => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td className="text-right">{student.orderCount}</td>
                      <td className="text-right">{formatCurrency(student.totalSales)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Orders List */}
          <h2>
            Orders {orderStatusFilter !== "all" && `(${orderStatusFilter.replace('_', ' ')})`}
          </h2>
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                {analytics.trackingMode !== 'none' && <th>Seller</th>}
                <th className="text-right">Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.customerName}</td>
                  {analytics.trackingMode !== 'none' && <td>{order.studentName || "—"}</td>}
                  <td className="text-right">{formatCurrency(order.total)}</td>
                  <td>
                    <span className={`status status-${order.fulfillmentStatus}`}>
                      {order.fulfillmentStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{format(new Date(order.createdAt), "MMM d")}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No orders to display</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
