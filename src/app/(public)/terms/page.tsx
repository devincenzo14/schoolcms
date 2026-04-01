export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Terms &amp; Conditions</h1>
          <p className="text-blue-100">Last updated: January 1, 2025</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 space-y-8 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the Edulinks Learning Center website and services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Educational Services</h2>
            <p>
              Edulinks Learning Center provides educational services including but not limited to Preschool, Elementary, Junior High School, and Senior High School programs, as well as Academic Enrichment Programs. The school reserves the right to modify, suspend, or discontinue any program at its discretion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Enrollment &amp; Admission</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>All enrollment applications are subject to review and approval by the school administration.</li>
              <li>Submitted documents and information must be accurate and complete.</li>
              <li>The school reserves the right to deny or revoke admission based on incomplete or falsified information.</li>
              <li>Enrollment fees and tuition are subject to change and must be settled according to the school&apos;s payment schedule.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Student Conduct</h2>
            <p>
              Students are expected to adhere to the school&apos;s code of conduct and maintain respect for fellow students, teachers, staff, and school property. Violations may result in disciplinary action, including suspension or expulsion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Intellectual Property</h2>
            <p>
              All content on this website, including text, images, logos, and design, is the property of Edulinks Learning Center and is protected by intellectual property laws. Unauthorized reproduction or distribution is prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Website Use</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>You agree not to use the website for any unlawful purpose.</li>
              <li>You agree not to attempt to gain unauthorized access to any part of the website or its systems.</li>
              <li>The school is not liable for any disruptions or errors on the website.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Limitation of Liability</h2>
            <p>
              Edulinks Learning Center shall not be held liable for any indirect, incidental, or consequential damages arising from the use of our website or services. The school provides educational services on an &quot;as is&quot; basis.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Modifications</h2>
            <p>
              The school reserves the right to update or modify these Terms and Conditions at any time without prior notice. Continued use of the website after changes constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Contact</h2>
            <p>
              For questions regarding these Terms and Conditions, please contact us at{" "}
              <a href="mailto:edulinks.ph@gmail.com" className="text-blue-600 hover:underline">edulinks.ph@gmail.com</a>{" "}
              or call <span className="font-medium">0910 769 4124</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
