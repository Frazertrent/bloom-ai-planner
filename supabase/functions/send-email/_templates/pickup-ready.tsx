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

interface PickupReadyEmailProps {
  sellerName: string;
  campaignName: string;
  organizationName: string;
  orderCount: number;
  pickupDate: string;
  pickupLocation: string;
  portalLink: string;
}

export const PickupReadyEmail = ({
  sellerName,
  campaignName,
  organizationName,
  orderCount,
  pickupDate,
  pickupLocation,
  portalLink,
}: PickupReadyEmailProps) => (
  <Html>
    <Head />
    <Preview>Your flowers are ready for pickup!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={emoji}>🌷</Text>
          <Heading style={h1}>Your Flowers Are Ready!</Heading>
        </Section>

        <Text style={greeting}>Hi {sellerName}!</Text>
        
        <Text style={text}>
          Great news! The flowers from your <strong>{campaignName}</strong> orders are 
          ready for pickup. Please coordinate with {organizationName} to collect them.
        </Text>

        <Section style={statsBox}>
          <Text style={statsNumber}>{orderCount}</Text>
          <Text style={statsLabel}>Order{orderCount !== 1 ? 's' : ''} Ready</Text>
        </Section>

        <Section style={urgentBox}>
          <Text style={urgentTitle}>⏰ Time-Sensitive!</Text>
          <Text style={urgentText}>
            Fresh flowers have a limited shelf life. Please pick up your orders as soon as possible 
            to ensure they arrive fresh to your customers.
          </Text>
        </Section>

        <Section style={pickupSection}>
          <Text style={sectionTitle}>📍 Pickup Details</Text>
          <Hr style={hr} />
          <Text style={pickupItem}><strong>Date:</strong> {pickupDate}</Text>
          <Text style={pickupItem}><strong>Location:</strong> {pickupLocation}</Text>
        </Section>

        <Section style={buttonSection}>
          <Button style={primaryButton} href={portalLink}>
            View Order Details
          </Button>
        </Section>

        <Section style={checklistSection}>
          <Text style={sectionTitle}>✅ Pickup Checklist</Text>
          <Hr style={hr} />
          <Text style={checkItem}>☐ Bring a box or bags to transport flowers</Text>
          <Text style={checkItem}>☐ Keep flowers upright during transport</Text>
          <Text style={checkItem}>☐ Deliver to customers as soon as possible</Text>
          <Text style={checkItem}>☐ Include care instructions with each order</Text>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            Thank you for supporting {organizationName}!
          </Text>
          <Text style={footerSmall}>
            Powered by BloomFundr
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default PickupReadyEmail

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
  backgroundColor: '#10b981',
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

const urgentBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '8px',
  margin: '24px',
  padding: '16px',
}

const urgentTitle = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px',
}

const urgentText = {
  color: '#92400e',
  fontSize: '14px',
  margin: '0',
  lineHeight: '22px',
}

const pickupSection = {
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

const pickupItem = {
  color: '#4b5563',
  fontSize: '14px',
  margin: '8px 0',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '24px',
}

const primaryButton = {
  backgroundColor: '#10b981',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '14px 24px',
}

const checklistSection = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  margin: '24px',
  padding: '20px',
}

const checkItem = {
  color: '#4b5563',
  fontSize: '14px',
  margin: '8px 0',
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
