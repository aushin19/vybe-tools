'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FaqSection() {
  return (
    <section className="py-16 px-4 md:px-6 w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="plan-change">
          <AccordionTrigger>Can I change my plan later?</AccordionTrigger>
          <AccordionContent>
            Yes, you can upgrade or downgrade your plan at any time. Your billing will be prorated based on the remaining time on your current subscription.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="commitments">
          <AccordionTrigger>Are there any long-term commitments?</AccordionTrigger>
          <AccordionContent>
            No, all plans are subscription-based and you can cancel anytime. For yearly subscriptions, you pay for the entire year upfront but can still cancel; however, refunds are subject to our refund policy.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="payment">
          <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
          <AccordionContent>
            We accept credit/debit cards, UPI, and netbanking through our payment processor, Razorpay.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="trial">
          <AccordionTrigger>Is there a free trial?</AccordionTrigger>
          <AccordionContent>
            Currently, we don't offer a free trial but we do have a one-week plan so you can try our services with minimal commitment.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="limits">
          <AccordionTrigger>What happens if I exceed my plan's limits?</AccordionTrigger>
          <AccordionContent>
            If you approach your plan's limits, we'll notify you and suggest upgrading to a higher tier. We don't automatically charge for overages.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="refunds">
          <AccordionTrigger>Do you offer refunds?</AccordionTrigger>
          <AccordionContent>
            For monthly and weekly plans, we don't offer refunds for partial billing periods. For yearly plans, refunds may be available within the first 30 days. Please contact our support team for more details.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
} 