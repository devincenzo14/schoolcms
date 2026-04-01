export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-blue-100">Last updated: January 1, 2025</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 space-y-8 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p className="mb-3">We collect the following types of information:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Personal Information:</strong> Name, email address, phone number, address, and date of birth provided during enrollment or inquiry.</li>
              <li><strong>Student Records:</strong> Academic records, grades, attendance, and other educational data.</li>
              <li><strong>Usage Data:</strong> Information about how you interact with our website, including pages visited and features used.</li>
              <li><strong>Images:</strong> Photos taken during school events that may be published on our website or social media.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To process enrollment applications and manage student records.</li>
              <li>To communicate with parents, guardians, and students about school activities, announcements, and updates.</li>
              <li>To improve our educational programs and website experience.</li>
              <li>To comply with legal and regulatory requirements.</li>
              <li>To ensure the safety and security of students and staff.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Data Protection</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Access to student records is restricted to authorized school personnel only.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Information Sharing</h2>
            <p className="mb-3">We do not sell, trade, or rent your personal information to third parties. We may share information only in the following cases:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>With authorized school staff who need access to perform their duties.</li>
              <li>With government agencies as required by Philippine law (e.g., DepEd reporting).</li>
              <li>With your explicit consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Data Retention</h2>
            <p>
              We retain personal information for as long as necessary to fulfill the purposes outlined in this policy, or as required by law. Student academic records are retained in accordance with Department of Education (DepEd) regulations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Your Rights</h2>
            <p className="mb-3">Under the Philippine Data Privacy Act of 2012 (RA 10173), you have the right to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Access your personal data held by the school.</li>
              <li>Request correction of inaccurate or incomplete data.</li>
              <li>Request deletion of your data, subject to legal retention requirements.</li>
              <li>Object to the processing of your data in certain circumstances.</li>
              <li>Lodge a complaint with the National Privacy Commission.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Cookies</h2>
            <p>
              Our website uses cookies to enhance your browsing experience and for authentication purposes. By continuing to use our website, you consent to the use of cookies. You may disable cookies in your browser settings, but some features may not function properly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Children&apos;s Privacy</h2>
            <p>
              We are committed to protecting the privacy of minors. Personal information of students under 18 is collected with the consent of their parents or legal guardians and is used solely for educational purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with a revised &quot;Last updated&quot; date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy or how we handle your data, please contact us at{" "}
              <a href="mailto:edulinks.ph@gmail.com" className="text-blue-600 hover:underline">edulinks.ph@gmail.com</a>{" "}
              or call <span className="font-medium">0910 769 4124</span>.
            </p>
            <p className="mt-2">
              Edulinks Learning Center<br />
              Deca Homes, Tunghaan, Minglanilla, Philippines, 6046
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
