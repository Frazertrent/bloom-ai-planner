import { format, parseISO } from "date-fns";

interface CSVColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => string | number);
}

export function generateCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: CSVColumn<T>[],
  filename: string
): void {
  // Generate header row
  const headers = columns.map((col) => `"${col.header}"`).join(",");

  // Generate data rows
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const value =
          typeof col.accessor === "function"
            ? col.accessor(item)
            : item[col.accessor];
        // Escape quotes and wrap in quotes
        const stringValue = String(value ?? "").replace(/"/g, '""');
        return `"${stringValue}"`;
      })
      .join(",")
  );

  // Combine headers and rows
  const csvContent = [headers, ...rows].join("\n");

  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${format(new Date(), "yyyy-MM-dd")}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Orders CSV columns
export function getOrdersCSVColumns() {
  return [
    { header: "Order #", accessor: "order_number" as const },
    { header: "Date", accessor: (o: any) => format(new Date(o.created_at), "yyyy-MM-dd HH:mm") },
    { header: "Customer Name", accessor: (o: any) => o.customer?.full_name || "" },
    { header: "Customer Email", accessor: (o: any) => o.customer?.email || "" },
    { header: "Customer Phone", accessor: (o: any) => o.customer?.phone || "" },
    { header: "Campaign", accessor: (o: any) => o.campaign?.name || "" },
    { header: "Student", accessor: (o: any) => o.attributed_student?.name || "Direct" },
    { header: "Items", accessor: (o: any) => o.order_items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0 },
    { header: "Subtotal", accessor: (o: any) => Number(o.subtotal).toFixed(2) },
    { header: "Platform Fee", accessor: (o: any) => Number(o.platform_fee).toFixed(2) },
    { header: "Processing Fee", accessor: (o: any) => Number(o.processing_fee).toFixed(2) },
    { header: "Total", accessor: (o: any) => Number(o.total).toFixed(2) },
    { header: "Payment Status", accessor: "payment_status" as const },
    { header: "Fulfillment Status", accessor: "fulfillment_status" as const },
    { header: "Entry Method", accessor: "entry_method" as const },
    { header: "Notes", accessor: (o: any) => o.notes || "" },
  ];
}

// Order items CSV columns (expanded line items)
export function getOrderItemsCSVColumns() {
  return [
    { header: "Order #", accessor: "order_number" as const },
    { header: "Customer Name", accessor: (o: any) => o.customer_name },
    { header: "Product", accessor: (o: any) => o.product_name },
    { header: "Category", accessor: (o: any) => o.category },
    { header: "Quantity", accessor: "quantity" as const },
    { header: "Unit Price", accessor: (o: any) => Number(o.unit_price).toFixed(2) },
    { header: "Line Total", accessor: (o: any) => (Number(o.unit_price) * o.quantity).toFixed(2) },
    { header: "Recipient Name", accessor: (o: any) => o.recipient_name || "" },
    { header: "Ribbon Text", accessor: (o: any) => o.ribbon_text || "" },
    { header: "Bow Color", accessor: (o: any) => o.bow_color || "" },
  ];
}

// Students performance CSV columns
export function getStudentsCSVColumns() {
  return [
    { header: "Name", accessor: "name" as const },
    { header: "Email", accessor: (s: any) => s.email || "" },
    { header: "Phone", accessor: (s: any) => s.phone || "" },
    { header: "Grade", accessor: (s: any) => s.grade || "" },
    { header: "Team/Group", accessor: (s: any) => s.team_group || "" },
    { header: "Total Sales", accessor: (s: any) => Number(s.total_sales || 0).toFixed(2) },
    { header: "Order Count", accessor: (s: any) => s.order_count || 0 },
    { header: "Rank", accessor: (s: any) => s.rank || "" },
    { header: "Status", accessor: (s: any) => s.is_active ? "Active" : "Inactive" },
    { header: "Magic Link Code", accessor: (s: any) => s.magic_link_code || "" },
  ];
}

// Financial summary CSV columns
export function getFinancialCSVColumns() {
  return [
    { header: "Campaign", accessor: "campaign_name" as const },
    { header: "Start Date", accessor: (f: any) => format(parseISO(f.start_date), "yyyy-MM-dd") },
    { header: "End Date", accessor: (f: any) => format(parseISO(f.end_date), "yyyy-MM-dd") },
    { header: "Total Orders", accessor: "order_count" as const },
    { header: "Gross Revenue", accessor: (f: any) => Number(f.gross_revenue).toFixed(2) },
    { header: "Platform Fees", accessor: (f: any) => Number(f.platform_fees).toFixed(2) },
    { header: "Processing Fees", accessor: (f: any) => Number(f.processing_fees).toFixed(2) },
    { header: "Florist Payout", accessor: (f: any) => Number(f.florist_payout).toFixed(2) },
    { header: "Organization Payout", accessor: (f: any) => Number(f.org_payout).toFixed(2) },
    { header: "Status", accessor: "status" as const },
  ];
}

// Product performance CSV columns
export function getProductPerformanceCSVColumns() {
  return [
    { header: "Product Name", accessor: "name" as const },
    { header: "Category", accessor: "category" as const },
    { header: "Base Cost", accessor: (p: any) => Number(p.base_cost).toFixed(2) },
    { header: "Retail Price", accessor: (p: any) => Number(p.retail_price).toFixed(2) },
    { header: "Units Sold", accessor: "units_sold" as const },
    { header: "Gross Revenue", accessor: (p: any) => Number(p.gross_revenue).toFixed(2) },
    { header: "Net Revenue", accessor: (p: any) => Number(p.net_revenue).toFixed(2) },
  ];
}
