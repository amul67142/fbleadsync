import React from 'react';

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 font-sans text-gray-800">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-900 underline decoration-blue-500">Terms of Service</h1>
      
      <p className="mb-6 italic text-gray-600">Last Updated: March 20, 2026</p>

      <section className="mb-8 p-6 bg-blue-50 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-4 text-blue-800">1. Agreement to Terms</h2>
        <p className="mb-4 leading-relaxed">
          By accessing or using **LeadSync** (provided by **Realvibe**), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-800 border-b-2 border-blue-100 pb-2">2. Description of Service</h2>
        <p className="mb-4 leading-relaxed">
          LeadSync is a lead management platform that integrates with Meta (Facebook/Instagram) to capture and store lead data generated through Lead Ads.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-800 border-b-2 border-blue-100 pb-2">3. User Responsibilities</h2>
        <p className="mb-4 leading-relaxed">
          You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account. You agree to use the service only for lawful purposes and in accordance with Meta&apos;s Platform Policies.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-800 border-b-2 border-blue-100 pb-2">4. Data Handling and Privacy</h2>
        <p className="mb-4 leading-relaxed">
          Your use of LeadSync is also governed by our Privacy Policy. You acknowledge that LeadSync processes data on your behalf as a data processor where applicable.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-800 border-b-2 border-blue-100 pb-2">5. Intellectual Property</h2>
        <p className="mb-4 leading-relaxed">
          The service and its original content, features, and functionality are and will remain the exclusive property of Realvibe.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-800 border-b-2 border-blue-100 pb-2">6. Limitation of Liability</h2>
        <p className="mb-4 leading-relaxed">
          In no event shall Realvibe be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
        </p>
      </section>

      <section className="mt-12 p-6 bg-gray-50 border-t-4 border-blue-500 text-center">
        <h2 className="text-2xl font-semibold mb-4 text-blue-900">7. Contact Information</h2>
        <p className="mb-2">Questions about the Terms of Service should be sent to us at:</p>
        <p className="text-lg font-bold text-blue-700">Realvibe Support</p>
        <p className="mt-4 text-sm text-gray-500">© 2026 Realvibe. All Rights Reserved.</p>
      </section>
    </div>
  );
}
