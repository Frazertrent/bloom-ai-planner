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
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface AllOrdersReadyEmailProps {
  organizationName: string;
  campaignName: string;
  totalOrders: number;
  floristName: string;
  pickupDate?: string;
  pickupLocation?: string;
  dashboardLink: string;
}

export const AllOrdersReadyEmail = ({
  organizationName,
  campaignName,
  totalOrders,
  floristName,
  pickupDate,
  pickupLocation,
  dashboardLink,
}: AllOrdersReadyEmailProps) => (
  <Html>
    <Head />
    <Preview>All orders ready for {campaignName}!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={checkmark}>✓</Text>
          <Heading style={h1}>All Orders Ready!</Heading>
          <Text style={subtitle}>{campaignName}</Text>
        </Section>

        <Text style={greeting}>Hi {organizationName} Team!</Text>
        
        <Text style={text}>
          Great news! <strong>{floristName}</strong> has completed all flower orders 
          for your campaign. Everything is ready for pickup and distribution to your sellers!
        </Text>

        <Section style={statsBox}>
          <Text style={statsNumber}>{totalOrders}</Text>
          <Text style={statsLabel}>Orders Ready for Pickup</Text>
        </Section>

        <Section style={pickupSection}>
          <Text style={sectionTitle}>📍 Pickup Information</Text>
          <Hr style={hr} />
          <Text style={pickupItem}><strong>Florist:</strong> {floristName}</Text>
          {pickupDate && <Text style={pickupItem}><strong>Date:</strong> {pickupDate}</Text>}
          {pickupLocation && <Text style={pickupItem}><strong>Location:</strong> {pickupLocation}</Text>}
        </Section>

        <Section style={nextStepsSection}>
          <Text style={sectionTitle}>📋 Next Steps</Text>
          <Hr style={hr} />
          <Text style={stepItem}>1. <strong>Coordinate pickup</strong> - Contact the florist to arrange pickup time</Text>
          <Text style={stepItem}>2. <strong>Notify sellers</strong> - Let sellers know when/where to collect their orders</Text>
          <Text style={stepItem}>3. <strong>Distribute orders</strong> - Match each order to its seller</Text>
          <Text style={stepItem}>4. <strong>Customer delivery</strong> - Sellers deliver to their customers</Text>
        </Section>

        <Section style={buttonSection}>
          <Button style={primaryButton} href={dashboardLink}>
            View Order Details
          </Button>
        </Section>

        <Section style={tipBox}>
          <Text style={tipTitle}>💡 Pro Tip</Text>
          <Text style={tipText}>
            Print order lists from your dashboard to make distribution easier. 
            Each list can be sorted by seller to streamline the handoff process.
          </Text>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            Congratulations on a successful campaign!
          </Text>
          <Text style={footerSmall}>
            Powered by BloomFundr
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default AllOrdersReadyEmail

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
  backgroundColor: '#22c55e',
  padding: '40px 20px',
  textAlign: 'center' as const,
  borderRadius: '8px 8px 0 0',
}

const checkmark = {
  fontSize: '48px',
  margin: '0',
  color: '#ffffff',
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

const statsBox = {
  backgroundColor: '#ecfdf5',
  borderRadius: '8px',
  margin: '24px',
  padding: '24px',
  textAlign: 'center' as const,
}

const statsNumber = {
  color: '#059669',
  fontSize: '48px',
  fontWeight: 'bold',
  margin: '0',
}

const statsLabel = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '8px 0 0',
}

const pickupSection = {
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  margin: '24px',
  padding: '20px',
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

const pickupItem = {
  color: '#1e40af',
  fontSize: '14px',
  margin: '8px 0',
}

const nextStepsSection = {
  margin: '24px',
}

const stepItem = {
  color: '#4b5563',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '24px',
}

const primaryButton = {
  backgroundColor: '#22c55e',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '14px 24px',
}

const tipBox = {
  backgroundColor: '#fefce8',
  borderRadius: '8px',
  margin: '24px',
  padding: '16px',
}

const tipTitle = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px',
}

const tipText = {
  color: '#92400e',
  fontSize: '14px',
  margin: '0',
  lineHeight: '22px',
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
