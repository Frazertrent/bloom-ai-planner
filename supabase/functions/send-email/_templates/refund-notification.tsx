import React from 'npm:react@18.3.1'
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'

interface RefundNotificationEmailProps {
  customerName: string;
  orderNumber: string;
  refundAmount: string;
  organizationName: string;
  campaignName: string;
  isPartial: boolean;
}

export function RefundNotificationEmail({
  customerName,
  orderNumber,
  refundAmount,
  organizationName,
  campaignName,
  isPartial,
}: RefundNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logo}>🌸 BloomFundr</Text>
          </Section>

          <Heading style={heading}>
            {isPartial ? 'Partial Refund Processed' : 'Refund Processed'}
          </Heading>

          <Text style={paragraph}>
            Hi {customerName},
          </Text>

          <Text style={paragraph}>
            We've processed a {isPartial ? 'partial ' : ''}refund for your order.
          </Text>

          <Section style={highlightBox}>
            <Text style={refundLabel}>Refund Amount</Text>
            <Text style={refundValue}>{refundAmount}</Text>
            <Text style={orderInfo}>Order #{orderNumber}</Text>
          </Section>

          <Section style={detailsBox}>
            <Text style={detailsLabel}>Order Details</Text>
            <Text style={detailsItem}>
              <strong>Campaign:</strong> {campaignName}
            </Text>
            <Text style={detailsItem}>
              <strong>Organization:</strong> {organizationName}
            </Text>
          </Section>

          <Text style={paragraph}>
            The refund will be credited back to your original payment method within 5-10 business days, 
            depending on your bank or card issuer.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            If you have any questions about this refund, please contact {organizationName} directly.
          </Text>

          <Text style={footerSmall}>
            Thank you for supporting local fundraisers!
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
  borderRadius: '8px',
}

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const logo = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#ec4899',
  margin: '0',
}

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  color: '#1a1a1a',
  margin: '0 0 24px',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#525252',
  margin: '0 0 16px',
}

const highlightBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
  margin: '24px 0',
  border: '1px solid #fcd34d',
}

const refundLabel = {
  fontSize: '14px',
  color: '#92400e',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const refundValue = {
  fontSize: '36px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 8px',
}

const orderInfo = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
}

const detailsBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
}

const detailsLabel = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#374151',
  margin: '0 0 12px',
}

const detailsItem = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 8px',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
}

const footer = {
  fontSize: '14px',
  color: '#6b7280',
  textAlign: 'center' as const,
  margin: '0 0 8px',
}

const footerSmall = {
  fontSize: '12px',
  color: '#9ca3af',
  textAlign: 'center' as const,
  margin: '0',
}

export default RefundNotificationEmail
