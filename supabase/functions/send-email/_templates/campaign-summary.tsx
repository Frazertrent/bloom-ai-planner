import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
  Button,
  Row,
  Column,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface TopSeller {
  name: string;
  totalSales: number;
  orderCount: number;
}

interface CampaignSummaryEmailProps {
  organizationName: string;
  campaignName: string;
  totalOrders: number;
  totalRevenue: number;
  organizationEarnings: number;
  topSellers: TopSeller[];
  dashboardLink: string;
  pickupDate?: string;
  pickupLocation?: string;
}

export const CampaignSummaryEmail = ({
  organizationName,
  campaignName,
  totalOrders,
  totalRevenue,
  organizationEarnings,
  topSellers,
  dashboardLink,
  pickupDate,
  pickupLocation,
}: CampaignSummaryEmailProps) => (
  <Html>
    <Head />
    <Preview>Campaign Complete - {campaignName} Summary</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={emoji}>🎉</Text>
          <Heading style={h1}>Campaign Complete!</Heading>
          <Text style={subtitle}>{campaignName}</Text>
        </Section>

        <Text style={greeting}>Hi {organizationName} Team!</Text>
        
        <Text style={text}>
          Congratulations! Your fundraising campaign has ended. Here's a summary of your success!
        </Text>

        <Section style={statsGrid}>
          <Row>
            <Column style={statBox}>
              <Text style={statNumber}>{totalOrders}</Text>
              <Text style={statLabel}>Total Orders</Text>
            </Column>
            <Column style={statBox}>
              <Text style={statNumber}>${totalRevenue.toFixed(0)}</Text>
              <Text style={statLabel}>Total Sales</Text>
            </Column>
          </Row>
        </Section>

        <Section style={earningsBox}>
          <Text style={earningsLabel}>Your Organization Earned</Text>
          <Text style={earningsAmount}>${organizationEarnings.toFixed(2)}</Text>
        </Section>

        {topSellers.length > 0 && (
          <Section style={leaderboardSection}>
            <Text style={sectionTitle}>🏆 Top Sellers</Text>
            <Hr style={hr} />
            {topSellers.slice(0, 3).map((seller, index) => (
              <Row key={index} style={leaderRow}>
                <Column style={rankCol}>
                  <Text style={rankBadge}>{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</Text>
                </Column>
                <Column style={sellerCol}>
                  <Text style={sellerName}>{seller.name}</Text>
                  <Text style={sellerStats}>{seller.orderCount} orders</Text>
                </Column>
                <Column style={salesCol}>
                  <Text style={salesAmount}>${seller.totalSales.toFixed(0)}</Text>
                </Column>
              </Row>
            ))}
          </Section>
        )}

        {(pickupDate || pickupLocation) && (
          <Section style={pickupSection}>
            <Text style={sectionTitle}>📅 Next Steps: Order Fulfillment</Text>
            <Hr style={hr} />
            {pickupDate && <Text style={pickupItem}><strong>Pickup Date:</strong> {pickupDate}</Text>}
            {pickupLocation && <Text style={pickupItem}><strong>Location:</strong> {pickupLocation}</Text>}
            <Text style={pickupNote}>
              Coordinate with your florist to ensure orders are ready for distribution to sellers.
            </Text>
          </Section>
        )}

        <Section style={buttonSection}>
          <Button style={primaryButton} href={dashboardLink}>
            View Full Report
          </Button>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            Thank you for using BloomFundr for your fundraising!
          </Text>
          <Text style={footerSmall}>
            Questions? Reply to this email for support.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default CampaignSummaryEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const headerSection = {
  background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
  padding: '40px 20px',
  textAlign: 'center' as const,
  borderRadius: '8px 8px 0 0',
}

const emoji = {
  fontSize: '48px',
  margin: '0',
}

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '16px 0 0',
  padding: '0',
}

const subtitle = {
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '16px',
  margin: '8px 0 0',
}

const greeting = {
  color: '#1f2937',
  fontSize: '18px',
  lineHeight: '28px',
  margin: '32px 24px 0',
}

const text = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 24px',
}

const statsGrid = {
  margin: '24px',
}

const statBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center' as const,
  margin: '0 6px',
}

const statNumber = {
  color: '#1f2937',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
}

const statLabel = {
  color: '#6b7280',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '8px 0 0',
}

const earningsBox = {
  background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
  borderRadius: '8px',
  margin: '24px',
  padding: '24px',
  textAlign: 'center' as const,
}

const earningsLabel = {
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '14px',
  margin: '0 0 8px',
}

const earningsAmount = {
  color: '#ffffff',
  fontSize: '40px',
  fontWeight: 'bold',
  margin: '0',
}

const leaderboardSection = {
  margin: '24px',
}

const sectionTitle = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '12px 0',
}

const leaderRow = {
  marginBottom: '12px',
  padding: '8px 0',
}

const rankCol = {
  width: '40px',
}

const rankBadge = {
  fontSize: '20px',
  margin: '0',
}

const sellerCol = {
  paddingLeft: '8px',
}

const sellerName = {
  color: '#1f2937',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0',
}

const sellerStats = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '2px 0 0',
}

const salesCol = {
  textAlign: 'right' as const,
}

const salesAmount = {
  color: '#059669',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0',
}

const pickupSection = {
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  margin: '24px',
  padding: '20px',
}

const pickupItem = {
  color: '#1e40af',
  fontSize: '14px',
  margin: '8px 0',
}

const pickupNote = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '12px 0 0',
  fontStyle: 'italic' as const,
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '24px',
}

const primaryButton = {
  backgroundColor: '#8b5cf6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '14px 24px',
}

const footer = {
  backgroundColor: '#f9fafb',
  borderRadius: '0 0 8px 8px',
  margin: '0',
  padding: '24px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#4b5563',
  fontSize: '14px',
  margin: '0 0 8px',
}

const footerSmall = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '0',
}
