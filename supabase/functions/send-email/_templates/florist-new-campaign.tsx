import React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from 'npm:@react-email/components@0.0.22'

interface FloristNewCampaignEmailProps {
  floristName: string;
  organizationName: string;
  campaignName: string;
  startDate: string;
  endDate: string;
  pickupDate?: string;
  pickupLocation?: string;
  productCount: number;
  expectedOrders?: number;
  dashboardLink: string;
}

export const FloristNewCampaignEmail = ({
  floristName,
  organizationName,
  campaignName,
  startDate,
  endDate,
  pickupDate,
  pickupLocation,
  productCount,
  expectedOrders,
  dashboardLink,
}: FloristNewCampaignEmailProps) => (
  <Html>
    <Head />
    <Preview>New campaign created - {campaignName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={emoji}>🌸</Text>
          <Heading style={h1}>New Campaign!</Heading>
          <Text style={subtitle}>{campaignName}</Text>
        </Section>

        <Text style={greeting}>Hi {floristName}!</Text>
        
        <Text style={text}>
          Great news! <strong>{organizationName}</strong> has just launched a new fundraising 
          campaign featuring your products. Get ready for orders!
        </Text>

        <Section style={campaignBox}>
          <Text style={campaignLabel}>Campaign Details</Text>
          <Text style={campaignName as React.CSSProperties}>{campaignName}</Text>
          <Text style={campaignOrg}>by {organizationName}</Text>
        </Section>

        <Section style={datesSection}>
          <Text style={sectionTitle}>📅 Important Dates</Text>
          <Hr style={hr} />
          <Row style={dateRow}>
            <Column>
              <Text style={dateLabel}>Campaign Starts</Text>
              <Text style={dateValue}>{startDate}</Text>
            </Column>
            <Column>
              <Text style={dateLabel}>Campaign Ends</Text>
              <Text style={dateValue}>{endDate}</Text>
            </Column>
          </Row>
          {pickupDate && (
            <Text style={pickupText}>
              <strong>Seller Pickup:</strong> {pickupDate}
              {pickupLocation && ` at ${pickupLocation}`}
            </Text>
          )}
        </Section>

        <Section style={statsSection}>
          <Text style={sectionTitle}>📦 What to Expect</Text>
          <Hr style={hr} />
          <Row style={statsRow}>
            <Column style={statBox}>
              <Text style={statNumber}>{productCount}</Text>
              <Text style={statLabel}>Product{productCount !== 1 ? 's' : ''} Featured</Text>
            </Column>
            {expectedOrders && (
              <Column style={statBox}>
                <Text style={statNumber}>{expectedOrders}+</Text>
                <Text style={statLabel}>Expected Orders</Text>
              </Column>
            )}
          </Row>
        </Section>

        <Section style={checklistSection}>
          <Text style={sectionTitle}>✅ Preparation Checklist</Text>
          <Hr style={hr} />
          <Text style={checkItem}>☐ Review campaign products and pricing</Text>
          <Text style={checkItem}>☐ Ensure sufficient inventory for expected orders</Text>
          <Text style={checkItem}>☐ Plan production schedule around pickup date</Text>
          <Text style={checkItem}>☐ Confirm pickup logistics with organization</Text>
        </Section>

        <Section style={buttonSection}>
          <Button style={primaryButton} href={dashboardLink}>
            View Campaign Details
          </Button>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            Questions? Contact {organizationName} to discuss campaign details.
          </Text>
          <Text style={footerSmall}>
            Powered by BloomFundr
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

// Styles
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
  padding: '32px 40px 24px',
  textAlign: 'center' as const,
  backgroundColor: '#fef3e2',
}

const emoji = {
  fontSize: '48px',
  margin: '0 0 8px',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 4px',
  padding: '0',
}

const subtitle = {
  color: '#666',
  fontSize: '16px',
  margin: '0',
}

const greeting = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '600',
  padding: '32px 40px 0',
  margin: '0',
}

const text = {
  color: '#444',
  fontSize: '15px',
  lineHeight: '24px',
  padding: '12px 40px 0',
  margin: '0',
}

const campaignBox = {
  backgroundColor: '#fef3e2',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 40px',
  textAlign: 'center' as const,
}

const campaignLabel = {
  color: '#666',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 8px',
}

const campaignOrg = {
  color: '#666',
  fontSize: '14px',
  margin: '4px 0 0',
}

const datesSection = {
  padding: '0 40px',
  margin: '24px 0',
}

const sectionTitle = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const hr = {
  borderColor: '#e6e6e6',
  margin: '8px 0 16px',
}

const dateRow = {
  marginBottom: '12px',
}

const dateLabel = {
  color: '#666',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  margin: '0 0 4px',
}

const dateValue = {
  color: '#1a1a1a',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0',
}

const pickupText = {
  color: '#444',
  fontSize: '14px',
  margin: '12px 0 0',
  padding: '12px',
  backgroundColor: '#f0f9ff',
  borderRadius: '6px',
}

const statsSection = {
  padding: '0 40px',
  margin: '24px 0',
}

const statsRow = {
  textAlign: 'center' as const,
}

const statBox = {
  padding: '16px',
}

const statNumber = {
  color: '#10b981',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0',
}

const statLabel = {
  color: '#666',
  fontSize: '13px',
  margin: '4px 0 0',
}

const checklistSection = {
  padding: '0 40px',
  margin: '24px 0',
}

const checkItem = {
  color: '#444',
  fontSize: '14px',
  margin: '8px 0',
}

const buttonSection = {
  padding: '24px 40px',
  textAlign: 'center' as const,
}

const primaryButton = {
  backgroundColor: '#f97316',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const footer = {
  padding: '24px 40px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e6e6e6',
}

const footerText = {
  color: '#666',
  fontSize: '14px',
  margin: '0 0 8px',
}

const footerSmall = {
  color: '#999',
  fontSize: '12px',
  margin: '0',
}

export default FloristNewCampaignEmail
