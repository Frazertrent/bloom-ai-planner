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

interface SellerWelcomeEmailProps {
  sellerName: string;
  campaignName: string;
  organizationName: string;
  sellingLink: string;
  portalLink: string;
  startDate: string;
  endDate: string;
  pickupDate?: string;
  pickupLocation?: string;
}

export const SellerWelcomeEmail = ({
  sellerName,
  campaignName,
  organizationName,
  sellingLink,
  portalLink,
  startDate,
  endDate,
  pickupDate,
  pickupLocation,
}: SellerWelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>You're registered for {campaignName}!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={emoji}>🌸</Text>
          <Heading style={h1}>You're In!</Heading>
          <Text style={subtitle}>Ready to start fundraising</Text>
        </Section>

        <Text style={greeting}>Hi {sellerName}!</Text>
        
        <Text style={text}>
          You're now registered as a seller for <strong>{campaignName}</strong>. 
          Share your unique link with friends and family to start raising money for {organizationName}!
        </Text>

        <Section style={linkBox}>
          <Text style={linkLabel}>Your Unique Selling Link</Text>
          <Text style={linkText}>{sellingLink}</Text>
          <Text style={linkHint}>Share this link with everyone you know!</Text>
        </Section>

        <Section style={buttonSection}>
          <Button style={primaryButton} href={sellingLink}>
            Share Your Link
          </Button>
          <Button style={secondaryButton} href={portalLink}>
            View Your Dashboard
          </Button>
        </Section>

        <Section style={tipsSection}>
          <Text style={sectionTitle}>💡 Tips for Success</Text>
          <Hr style={hr} />
          <Text style={tipItem}>📱 <strong>Share on social media</strong> - Post your link on Instagram, Facebook, and TikTok</Text>
          <Text style={tipItem}>💬 <strong>Text your contacts</strong> - Personal messages get the best response</Text>
          <Text style={tipItem}>🏠 <strong>Tell your neighbors</strong> - Local support makes a big difference</Text>
          <Text style={tipItem}>🔄 <strong>Follow up</strong> - A gentle reminder before the deadline helps</Text>
        </Section>

        <Section style={datesSection}>
          <Text style={sectionTitle}>📅 Important Dates</Text>
          <Hr style={hr} />
          <Text style={dateItem}><strong>Campaign Period:</strong> {startDate} - {endDate}</Text>
          {pickupDate && <Text style={dateItem}><strong>Pickup Date:</strong> {pickupDate}</Text>}
          {pickupLocation && <Text style={dateItem}><strong>Pickup Location:</strong> {pickupLocation}</Text>}
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            Good luck with your fundraising! Every sale helps {organizationName}.
          </Text>
          <Text style={footerSmall}>
            Powered by BloomFundr
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default SellerWelcomeEmail

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
  background: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
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
  fontSize: '32px',
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

const linkBox = {
  backgroundColor: '#fdf4ff',
  border: '2px dashed #d946ef',
  borderRadius: '8px',
  margin: '24px',
  padding: '20px',
  textAlign: 'center' as const,
}

const linkLabel = {
  color: '#86198f',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 12px',
  fontWeight: 'bold',
}

const linkText = {
  color: '#1f2937',
  fontSize: '14px',
  fontFamily: 'monospace',
  backgroundColor: '#ffffff',
  padding: '12px',
  borderRadius: '4px',
  margin: '0 0 8px',
  wordBreak: 'break-all' as const,
}

const linkHint = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '8px 0 0',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '24px',
}

const primaryButton = {
  backgroundColor: '#ec4899',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '14px 24px',
  margin: '0 0 12px',
}

const secondaryButton = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  color: '#4b5563',
  fontSize: '14px',
  fontWeight: '500',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
}

const tipsSection = {
  backgroundColor: '#fefce8',
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

const tipItem = {
  color: '#4b5563',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0',
}

const datesSection = {
  margin: '24px',
}

const dateItem = {
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
