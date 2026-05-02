import Nav from "@/components/nav";

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <Nav />
      <div className="max-w-3xl mx-auto px-4 py-12 prose prose-stone prose-sm max-w-none">
        <h1 className="text-3xl font-bold text-[#1A1209]">Terms of Service</h1>
        <p className="text-[#8A7A68] text-sm">Effective: January 1, 2025 · Last updated: May 2025</p>

        <h2>1. About SevaSetu</h2>
        <p>SevaSetu ("we", "us", "the platform") is a hyperlocal home-services marketplace connecting residents of Indore, Madhya Pradesh, with independent verified craftsmen ("Karigar"). By using this platform, you agree to these terms.</p>

        <h2>2. Services Provided</h2>
        <p>SevaSetu provides a technology platform to facilitate bookings between customers and service professionals. We do not directly employ craftsmen — they are independent professionals. We are responsible for matching, verification, and quality assurance only.</p>

        <h2>3. Booking & Confirmation</h2>
        <p>A booking is confirmed only after we assign a craftsman and send you a confirmation message. We reserve the right to cancel a booking if no suitable craftsman is available, in which case no charge will be levied.</p>

        <h2>4. Pricing & Payments</h2>
        <p>Prices shown are estimates. Actual charges depend on scope of work. A convenience fee of ₹75 applies to all bookings. Platform fee (15% of job value) is used to maintain the platform. All payments should be made through official SevaSetu channels.</p>

        <h2>5. Cancellations & Refunds</h2>
        <p>Customers may cancel pending or confirmed bookings without penalty. If work has begun, cancellation charges may apply. For refund claims, please refer to our <a href="/refund" className="text-primary">Refund Policy</a>.</p>

        <h2>6. Guarantee</h2>
        <p>We offer a 48-hour re-do guarantee. If you are unsatisfied with the quality of work, report it within 48 hours and we will send the craftsman back at no extra charge.</p>

        <h2>7. Liability</h2>
        <p>SevaSetu's liability is limited to the amount paid for the specific booking in question. We are not liable for property damage caused by craftsmen — please ensure you report concerns immediately via the Report Issue feature.</p>

        <h2>8. User Conduct</h2>
        <p>Users must not abuse, threaten, or harass craftsmen. Fraudulent bookings or false reports may result in account suspension.</p>

        <h2>9. Changes to Terms</h2>
        <p>We may update these terms at any time. Continued use of the platform constitutes acceptance of the updated terms.</p>

        <h2>10. Contact</h2>
        <p>For any legal queries, contact us at: <strong>legal@sevasetu.in</strong> or call <strong>+91 77777 77777</strong>.</p>
      </div>
    </div>
  );
}
