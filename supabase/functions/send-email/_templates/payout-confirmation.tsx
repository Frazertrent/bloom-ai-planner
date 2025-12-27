import React from 'npm:react@18.3.1'
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
} from 'npm:@react-email/components@0.0.22'

interface PayoutConfirmationEmailProps {
  recipientName: string;
  recipientType: 'florist' | 'organization';
  amount: string;
  payoutCount: number;
  campaignNames: string[];
  dashboardLink: string;
}

export function PayoutConfirmationEmail({
  recipientName,
  recipientType,
  amount,
  payoutCount,
  campaignNames,
  dashboardLink,
}: PayoutConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logo}>🌸 BloomFundr</Text>
          </Section>

          <Heading style={heading}>Payout Processed!</Heading>

          <Text style={paragraph}>
            Hi {recipientName},
          </Text>

          <Text style={paragraph}>
            Great news! We've successfully processed your payout{payoutCount > 1 ? 's' : ''}.
          </Text>

          <Section style={highlightBox}>
            <Text style={amountLabel}>Amount Transferred</Text>
            <Text style={amountValue}>{amount}</Text>
            <Text style={amountNote}>
              {payoutCount} payout{payoutCount > 1 ? 's' : ''} from {campaignNames.length === 1 
                ? campaignNames[0] 
                : `${campaignNames.length} campaigns`}
            </Text>
          </Section>

          <Text style={paragraph}>
            The funds will be deposited to your bank account according to your Stripe payout schedule 
            (typically 2-7 business days depending on your country).
          </Text>

          {campaignNames.length > 1 && (
            <Section style={campaignList}>
              <Text style={campaignListLabel}>Campaigns included:</Text>
              {campaignNames.map((name, i) => (
                <Text key={i} style={campaignListItem}>• {name}</Text>
              ))}
            </Section>
          )}

          <Section style={buttonSection}>
            <Button style={button} href={dashboardLink}>
              View Payout History
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Thank you for being part of BloomFundr! 🌷
          </Text>

          <Text style={footerSmall}>
            If you have questions about your payout, please check your Stripe Dashboard 
            or contact our support team.
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
  backgroundColor: '#ecfdf5',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
  margin: '24px 0',
  border: '1px solid #a7f3d0',
}

const amountLabel = {
  fontSize: '14px',
  color: '#059669',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const amountValue = {
  fontSize: '36px',
  fontWeight: 'bold',
  color: '#059669',
  margin: '0 0 8px',
}

const amountNote = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
}

const campaignList = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
}

const campaignListLabel = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#374151',
  margin: '0 0 8px',
}

const campaignListItem = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 4px',
  paddingLeft: '8px',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#ec4899',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
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

export default PayoutConfirmationEmail
