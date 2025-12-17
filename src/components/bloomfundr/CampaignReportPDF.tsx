import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { format } from "date-fns";

// Register a font for better typography
Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2", fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Inter",
    fontSize: 10,
    color: "#1a1a1a",
  },
  header: {
    marginBottom: 30,
    borderBottom: "2 solid #10b981",
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: "#10b981",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  date: {
    fontSize: 10,
    color: "#888",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 12,
    color: "#333",
    borderBottom: "1 solid #e5e5e5",
    paddingBottom: 6,
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
  },
  label: {
    width: 140,
    color: "#666",
  },
  value: {
    flex: 1,
    fontWeight: 600,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: "48%",
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    border: "1 solid #e5e5e5",
  },
  statLabel: {
    fontSize: 9,
    color: "#666",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 700,
    color: "#10b981",
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 8,
    fontWeight: 600,
    borderBottom: "1 solid #e5e5e5",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottom: "1 solid #f3f4f6",
  },
  tableRowAlt: {
    backgroundColor: "#fafafa",
  },
  tableCell: {
    flex: 1,
  },
  tableCellNarrow: {
    width: 60,
  },
  tableCellWide: {
    flex: 2,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#888",
    borderTop: "1 solid #e5e5e5",
    paddingTop: 10,
  },
  moneyPositive: {
    color: "#10b981",
    fontWeight: 600,
  },
  moneyNegative: {
    color: "#ef4444",
    fontWeight: 600,
  },
});

interface CampaignReportData {
  campaign: {
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    pickup_date?: string;
    pickup_location?: string;
    status: string;
  };
  organization: {
    name: string;
  };
  florist: {
    business_name: string;
  };
  stats: {
    totalOrders: number;
    totalRevenue: number;
    platformFees: number;
    processingFees: number;
    floristPayout: number;
    orgPayout: number;
    avgOrderValue: number;
  };
  orders: Array<{
    order_number: string;
    customer_name: string;
    total: number;
    items: number;
    status: string;
    date: string;
  }>;
  students: Array<{
    name: string;
    total_sales: number;
    order_count: number;
    rank: number;
  }>;
  products: Array<{
    name: string;
    category: string;
    units_sold: number;
    revenue: number;
  }>;
}

export function CampaignReportPDF({ data }: { data: CampaignReportData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{data.campaign.name}</Text>
          <Text style={styles.subtitle}>Campaign Performance Report</Text>
          <Text style={styles.date}>
            Generated on {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
          </Text>
        </View>

        {/* Campaign Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Campaign Overview</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Organization:</Text>
            <Text style={styles.value}>{data.organization.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Florist Partner:</Text>
            <Text style={styles.value}>{data.florist.business_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Campaign Period:</Text>
            <Text style={styles.value}>
              {format(new Date(data.campaign.start_date), "MMM d")} -{" "}
              {format(new Date(data.campaign.end_date), "MMM d, yyyy")}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{data.campaign.status.toUpperCase()}</Text>
          </View>
          {data.campaign.pickup_date && (
            <View style={styles.row}>
              <Text style={styles.label}>Seller Pickup:</Text>
              <Text style={styles.value}>
                {format(new Date(data.campaign.pickup_date), "MMM d, yyyy")} at{" "}
                {data.campaign.pickup_location}
              </Text>
            </View>
          )}
        </View>

        {/* Statistics */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Orders</Text>
            <Text style={styles.statValue}>{data.stats.totalOrders}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Gross Revenue</Text>
            <Text style={styles.statValue}>${data.stats.totalRevenue.toFixed(2)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Avg Order Value</Text>
            <Text style={styles.statValue}>${data.stats.avgOrderValue.toFixed(2)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Organization Earnings</Text>
            <Text style={styles.statValue}>${data.stats.orgPayout.toFixed(2)}</Text>
          </View>
        </View>

        {/* Financial Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Breakdown</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Gross Revenue:</Text>
            <Text style={[styles.value, styles.moneyPositive]}>
              ${data.stats.totalRevenue.toFixed(2)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Platform Fees:</Text>
            <Text style={[styles.value, styles.moneyNegative]}>
              -${data.stats.platformFees.toFixed(2)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Processing Fees:</Text>
            <Text style={[styles.value, styles.moneyNegative]}>
              -${data.stats.processingFees.toFixed(2)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Florist Payout:</Text>
            <Text style={styles.value}>${data.stats.floristPayout.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Organization Payout:</Text>
            <Text style={[styles.value, styles.moneyPositive]}>
              ${data.stats.orgPayout.toFixed(2)}
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          BloomFundr Campaign Report • Confidential • Page 1
        </Text>
      </Page>

      {/* Page 2: Orders & Students */}
      <Page size="A4" style={styles.page}>
        {/* Top Students */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performers</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.tableCellNarrow]}>Rank</Text>
              <Text style={[styles.tableCell, styles.tableCellWide]}>Student</Text>
              <Text style={styles.tableCell}>Orders</Text>
              <Text style={styles.tableCell}>Sales</Text>
            </View>
            {data.students.slice(0, 10).map((student, index) => (
              <View
                key={index}
                style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
              >
                <Text style={[styles.tableCell, styles.tableCellNarrow]}>
                  #{student.rank}
                </Text>
                <Text style={[styles.tableCell, styles.tableCellWide]}>
                  {student.name}
                </Text>
                <Text style={styles.tableCell}>{student.order_count}</Text>
                <Text style={[styles.tableCell, styles.moneyPositive]}>
                  ${student.total_sales.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Product Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Performance</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.tableCellWide]}>Product</Text>
              <Text style={styles.tableCell}>Category</Text>
              <Text style={styles.tableCell}>Units</Text>
              <Text style={styles.tableCell}>Revenue</Text>
            </View>
            {data.products.map((product, index) => (
              <View
                key={index}
                style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
              >
                <Text style={[styles.tableCell, styles.tableCellWide]}>
                  {product.name}
                </Text>
                <Text style={styles.tableCell}>{product.category}</Text>
                <Text style={styles.tableCell}>{product.units_sold}</Text>
                <Text style={[styles.tableCell, styles.moneyPositive]}>
                  ${product.revenue.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCell}>Order #</Text>
              <Text style={[styles.tableCell, styles.tableCellWide]}>Customer</Text>
              <Text style={styles.tableCell}>Items</Text>
              <Text style={styles.tableCell}>Total</Text>
              <Text style={styles.tableCell}>Status</Text>
            </View>
            {data.orders.slice(0, 15).map((order, index) => (
              <View
                key={index}
                style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
              >
                <Text style={styles.tableCell}>{order.order_number}</Text>
                <Text style={[styles.tableCell, styles.tableCellWide]}>
                  {order.customer_name}
                </Text>
                <Text style={styles.tableCell}>{order.items}</Text>
                <Text style={[styles.tableCell, styles.moneyPositive]}>
                  ${order.total.toFixed(2)}
                </Text>
                <Text style={styles.tableCell}>{order.status}</Text>
              </View>
            ))}
          </View>
          {data.orders.length > 15 && (
            <Text style={{ marginTop: 8, fontSize: 9, color: "#888" }}>
              Showing 15 of {data.orders.length} orders
            </Text>
          )}
        </View>

        <Text style={styles.footer}>
          BloomFundr Campaign Report • Confidential • Page 2
        </Text>
      </Page>
    </Document>
  );
}
