import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Row,
  Column,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  recipientName?: string;
}

interface OrderConfirmationEmailProps {
  customerName: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  sellerName?: string;
  organizationName: string;
  campaignName: string;
  pickupDate?: string;
  pickupLocation?: string;
}

export const OrderConfirmationEmail = ({
  customerName,
  orderNumber,
  items,
  subtotal,
  total,
  sellerName,
  organizationName,
  campaignName,
  pickupDate,
  pickupLocation,
}: OrderConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Order Confirmed - {orderNumber}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={checkmark}>✓</Text>
          <Heading style={h1}>Order Confirmed!</Heading>
        </Section>

        <Text style={greeting}>Hi {customerName},</Text>
        
        <Text style={text}>
          Thank you for your order! Your support means the world to {organizationName}.
        </Text>

        {sellerName && (
          <Section style={sellerBadge}>
            <Text style={sellerText}>🌸 Supporting: <strong>{sellerName}</strong></Text>
          </Section>
        )}

        <Section style={orderBox}>
          <Text style={orderLabel}>Order Number</Text>
          <Text style={orderNumberText}>{orderNumber}</Text>
        </Section>

        <Section style={itemsSection}>
          <Text style={sectionTitle}>Order Details</Text>
          <Hr style={hr} />
          {items.map((item, index) => (
            <Row key={index} style={itemRow}>
              <Column style={itemNameCol}>
                <Text style={itemName}>{item.name}</Text>
                {item.recipientName && (
                  <Text style={recipientText}>For: {item.recipientName}</Text>
                )}
              </Column>
              <Column style={itemQtyCol}>
                <Text style={itemQty}>×{item.quantity}</Text>
              </Column>
              <Column style={itemPriceCol}>
                <Text style={itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
              </Column>
            </Row>
          ))}
          <Hr style={hr} />
          <Row style={totalRow}>
            <Column>
              <Text style={totalLabel}>Total</Text>
            </Column>
            <Column>
              <Text style={totalAmount}>${total.toFixed(2)}</Text>
            </Column>
          </Row>
        </Section>

        {(pickupDate || pickupLocation) && (
          <Section style={pickupSection}>
            <Text style={sectionTitle}>📍 Pickup Information</Text>
            {pickupDate && <Text style={pickupText}><strong>Date:</strong> {pickupDate}</Text>}
            {pickupLocation && <Text style={pickupText}><strong>Location:</strong> {pickupLocation}</Text>}
            <Text style={pickupNote}>You'll receive another email when your order is ready for pickup.</Text>
          </Section>
        )}

        <Section style={footer}>
          <Text style={footerText}>
            This order supports <strong>{campaignName}</strong> by {organizationName}
          </Text>
          <Text style={footerSmall}>
            Powered by BloomFundr
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default OrderConfirmationEmail

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
  padding: '32px 20px',
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

const sellerBadge = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  margin: '16px 24px',
  padding: '12px 16px',
}

const sellerText = {
  color: '#92400e',
  fontSize: '14px',
  margin: '0',
}

const orderBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  margin: '24px',
  padding: '20px',
  textAlign: 'center' as const,
}

const orderLabel = {
  color: '#6b7280',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 8px',
}

const orderNumberText = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
  fontFamily: 'monospace',
}

const itemsSection = {
  margin: '24px',
}

const sectionTitle = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '16px 0',
}

const itemRow = {
  marginBottom: '12px',
}

const itemNameCol = {
  width: '60%',
}

const itemQtyCol = {
  width: '15%',
  textAlign: 'center' as const,
}

const itemPriceCol = {
  width: '25%',
  textAlign: 'right' as const,
}

const itemName = {
  color: '#1f2937',
  fontSize: '14px',
  margin: '0',
}

const recipientText = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '4px 0 0',
  fontStyle: 'italic' as const,
}

const itemQty = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
}

const itemPrice = {
  color: '#1f2937',
  fontSize: '14px',
  margin: '0',
}

const totalRow = {
  marginTop: '8px',
}

const totalLabel = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
}

const totalAmount = {
  color: '#22c55e',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'right' as const,
}

const pickupSection = {
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  margin: '24px',
  padding: '20px',
}

const pickupText = {
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
