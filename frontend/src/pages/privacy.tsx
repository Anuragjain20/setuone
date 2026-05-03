import Nav from "@/components/nav";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <Nav />
      <div className="max-w-3xl mx-auto px-4 py-12 prose prose-stone prose-sm max-w-none">
        <h1 className="text-3xl font-bold text-[#1A1209]">Privacy Policy</h1>
        <p className="text-[#8A7A68] text-sm">Effective: January 1, 2025 · Compliant with IT Act, 2000 & DPDP Act, 2023</p>

        <h2>1. Data We Collect</h2>
        <ul>
          <li><strong>Account data:</strong> Mobile phone number, name (optional)</li>
          <li><strong>Booking data:</strong> Service type, address, date/time, description of problem</li>
          <li><strong>Usage data:</strong> Pages visited, interactions within the platform</li>
          <li><strong>Communications:</strong> Ratings, reviews, dispute reports</li>
        </ul>

        <h2>2. How We Use Your Data</h2>
        <ul>
          <li>To match you with the right craftsman for your booking</li>
          <li>To send booking confirmations and status updates via SMS/WhatsApp</li>
          <li>To improve service quality and train our craftsmen</li>
          <li>To process payments and generate invoices</li>
          <li>To resolve disputes and enforce our guarantee</li>
        </ul>

        <h2>3. Data Sharing</h2>
        <p>We share only the minimum required data with craftsmen (your name, phone, address) to fulfil your booking. We do not sell your data to third parties. We may share data with legal authorities if required by law.</p>

        <h2>4. Data Retention</h2>
        <p>Booking data is retained for 3 years for legal and warranty purposes. Account data is retained until you request deletion. You may request deletion by emailing <strong>privacy@sevasetu.in</strong>.</p>

        <h2>5. Security</h2>
        <p>All data is stored on encrypted servers. OTP-based authentication ensures only you can access your account. We conduct regular security audits.</p>

        <h2>6. Your Rights (DPDP Act 2023)</h2>
        <ul>
          <li>Right to access your personal data</li>
          <li>Right to correct inaccurate data</li>
          <li>Right to erasure of your data</li>
          <li>Right to withdraw consent</li>
        </ul>
        <p>To exercise any of these rights, contact: <strong>privacy@sevasetu.in</strong></p>

        <h2>7. Cookies</h2>
        <p>We use session cookies to maintain your login state. No tracking cookies or advertising cookies are used.</p>

        <h2>8. Contact</h2>
        <p>Data Protection Officer: <strong>dpo@sevasetu.in</strong> · +91 77777 77777 · Indore, MP 452001</p>
      </div>
    </div>
  );
}

