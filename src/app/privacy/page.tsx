import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 font-sans text-gray-800">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-900 underline decoration-blue-500">Privacy Policy</h1>
      
      <p className="mb-6 italic text-gray-600">Last Updated: March 20, 2026</p>

      <section className="mb-8 p-6 bg-blue-50 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-4 text-blue-800">1. Introduction</h2>
        <p className="mb-4 leading-relaxed">
          Welcome to **LeadSync** (powered by **Realvibe**). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-800 border-b-2 border-blue-100 pb-2">2. Information We Collect</h2>
        <p className="mb-4 leading-relaxed">
          We collect personal information that you voluntarily provide to us when you express an interest in obtaining information about us or our products and services, or otherwise when you contact us.
        </p>
        <p className="mb-4 leading-relaxed font-medium">The personal information we collect includes:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li><strong>Name</strong> (Full Name)</li>
          <li><strong>Email Address</strong></li>
          <li><strong>Phone Number</strong> (Contact Details)</li>
          <li><strong>Company Name</strong> (Optional)</li>
          <li><strong>Lead Interest Data</strong> (Information related to your specific inquiry)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-800 border-b-2 border-blue-100 pb-2">3. How We Use Your Information</h2>
        <p className="mb-4 leading-relaxed">
          We use personal information collected via our Lead Forms for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
        </p>
        <p className="mb-4 leading-relaxed">We use the information we collect or receive:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>To facilitate account creation and logon process.</li>
          <li>To send you administrative information.</li>
          <li>To fulfill and manage your inquiries and requests.</li>
          <li>To deliver services to the user.</li>
          <li>To respond to user inquiries/offer support.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-800 border-b-2 border-blue-100 pb-2">4. Sharing Your Information</h2>
        <p className="mb-4 leading-relaxed">
          We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. Your information is stored securely and is never sold to third parties.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-800 border-b-2 border-blue-100 pb-2">5. Data Retention</h2>
        <p className="mb-4 leading-relaxed">
          We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy policy, unless a longer retention period is required or permitted by law.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-800 border-b-2 border-blue-100 pb-2">6. Security of Your Information</h2>
        <p className="mb-4 leading-relaxed">
          We use appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
        </p>
      </section>

      <section className="mt-12 p-6 bg-gray-50 border-t-4 border-blue-500 text-center">
        <h2 className="text-2xl font-semibold mb-4 text-blue-900">7. Contact Us</h2>
        <p className="mb-2">If you have questions or comments about this policy, you may contact us at:</p>
        <p className="text-lg font-bold text-blue-700">Realvibe Support</p>
        <p className="mt-4 text-sm text-gray-500">© 2026 Realvibe. All Rights Reserved.</p>
      </section>
    </div>
  );
}
