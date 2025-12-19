import React from 'npm:react@18.3.1'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { OrderConfirmationEmail } from './_templates/order-confirmation.tsx'
import { SellerWelcomeEmail } from './_templates/seller-welcome.tsx'
import { PickupReadyEmail } from './_templates/pickup-ready.tsx'
import { CampaignSummaryEmail } from './_templates/campaign-summary.tsx'
import { AllOrdersReadyEmail } from './_templates/all-orders-ready.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  type: 'order_confirmation' | 'seller_welcome' | 'pickup_ready' | 'campaign_summary' | 'all_orders_ready';
  to: string;
  data: Record<string, any>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { type, to, data }: EmailRequest = await req.json()

    console.log(`Sending ${type} email to ${to}`)

    let html: string
    let subject: string

    switch (type) {
      case 'order_confirmation':
        subject = `Order Confirmed - ${data.orderNumber}`
        html = await renderAsync(
          React.createElement(OrderConfirmationEmail, {
            customerName: data.customerName,
            orderNumber: data.orderNumber,
            items: data.items,
            subtotal: data.subtotal,
            total: data.total,
            sellerName: data.sellerName,
            organizationName: data.organizationName,
            campaignName: data.campaignName,
            pickupDate: data.pickupDate,
            pickupLocation: data.pickupLocation,
          })
        )
        break

      case 'seller_welcome':
        subject = `You're registered for ${data.campaignName}!`
        html = await renderAsync(
          React.createElement(SellerWelcomeEmail, {
            sellerName: data.sellerName,
            campaignName: data.campaignName,
            organizationName: data.organizationName,
            sellingLink: data.sellingLink,
            portalLink: data.portalLink,
            startDate: data.startDate,
            endDate: data.endDate,
            pickupDate: data.pickupDate,
            pickupLocation: data.pickupLocation,
          })
        )
        break

      case 'pickup_ready':
        subject = `Your flowers are ready for pickup!`
        html = await renderAsync(
          React.createElement(PickupReadyEmail, {
            sellerName: data.sellerName,
            campaignName: data.campaignName,
            organizationName: data.organizationName,
            orderCount: data.orderCount,
            pickupDate: data.pickupDate,
            pickupLocation: data.pickupLocation,
            portalLink: data.portalLink,
          })
        )
        break

      case 'campaign_summary':
        subject = `Campaign Complete - ${data.campaignName} Summary`
        html = await renderAsync(
          React.createElement(CampaignSummaryEmail, {
            organizationName: data.organizationName,
            campaignName: data.campaignName,
            totalOrders: data.totalOrders,
            totalRevenue: data.totalRevenue,
            organizationEarnings: data.organizationEarnings,
            topSellers: data.topSellers,
            dashboardLink: data.dashboardLink,
            pickupDate: data.pickupDate,
            pickupLocation: data.pickupLocation,
          })
        )
        break

      case 'all_orders_ready':
        subject = `All orders ready for ${data.campaignName}!`
        html = await renderAsync(
          React.createElement(AllOrdersReadyEmail, {
            organizationName: data.organizationName,
            campaignName: data.campaignName,
            totalOrders: data.totalOrders,
            floristName: data.floristName,
            pickupDate: data.pickupDate,
            pickupLocation: data.pickupLocation,
            dashboardLink: data.dashboardLink,
          })
        )
        break

      default:
        throw new Error(`Unknown email type: ${type}`)
    }

    const { error } = await resend.emails.send({
      from: 'BloomFundr <notifications@resend.dev>',
      to: [to],
      subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    console.log(`Successfully sent ${type} email to ${to}`)

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error: any) {
    console.error('Error in send-email function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
