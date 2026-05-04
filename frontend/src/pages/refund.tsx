import Nav from "@/components/nav";

export default function Refund() {
  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <Nav />
      <div className="max-w-3xl mx-auto px-4 py-12 prose prose-stone prose-sm max-w-none">
        <h1 className="text-3xl font-bold text-[#1A1209]">Refund & Cancellation Policy</h1>
        <p className="text-[#8A7A68] text-sm">Effective: January 1, 2025</p>

        <h2>1. Free Cancellation</h2>
        <p>You can cancel any <strong>pending</strong> or <strong>confirmed</strong> booking for free at any time before the craftsman departs for your location. No charges apply.</p>

        <h2>2. Late Cancellation</h2>
        <p>If the craftsman has already departed or is at your door, a ₹99 late cancellation fee may apply to cover travel costs. You will be notified before any charge is processed.</p>

        <h2>3. No-Show</h2>
        <p>If our craftsman does not show up within 60 minutes of the scheduled slot start time, your booking is automatically cancelled with a full refund and a ₹100 credit for your next booking.</p>

        <h2>4. Re-do Guarantee</h2>
        <p>If you are unsatisfied with the quality of work within <strong>48 hours</strong> of completion, use the "Report Issue" feature in your booking. We will re-send the craftsman at no extra cost.</p>

        <h2>5. Refunds After Payment</h2>
        <table>
          <thead>
            <tr><th>Scenario</th><th>Refund Amount</th><th>Timeline</th></tr>
          </thead>
          <tbody>
            <tr><td>Cancelled before work starts</td><td>100% of job fee + convenience fee</td><td>3–5 business days</td></tr>
            <tr><td>Craftsman no-show</td><td>100% + ₹100 credit</td><td>1–2 business days</td></tr>
            <tr><td>Poor quality (proven)</td><td>Up to 50% at SetuOne's discretion</td><td>5–7 business days</td></tr>
            <tr><td>After work completion</td><td>Not eligible</td><td>—</td></tr>
          </tbody>
        </table>

        <h2>6. How to Request a Refund</h2>
        <ol>
          <li>Use the "Report Issue" button on your booking card</li>
          <li>Or WhatsApp us at +91 77777 77777 with your booking number</li>
          <li>Our team will respond within 24 hours</li>
        </ol>

        <h2>7. Refund Method</h2>
        <p>Refunds are processed to the original payment method — UPI, card, or bank transfer. Cash payments are refunded via UPI. Contact us if you need an alternate refund method.</p>

        <h2>8. Contact</h2>
        <p><strong>refunds@setuone.in</strong> · +91 77777 77777 · Monday–Saturday, 9 AM – 7 PM</p>
      </div>
    </div>
  );
}

