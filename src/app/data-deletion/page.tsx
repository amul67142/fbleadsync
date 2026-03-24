import React from 'react';

export default function DataDeletion() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 font-sans text-gray-800">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-900 underline decoration-blue-500">User Data Deletion Instructions</h1>
      
      <p className="mb-6 italic text-gray-600 font-medium">To comply with Meta (Facebook/Instagram) platform policies, we provide the following instructions for users to request the deletion of their data from LeadSync.</p>

      <section className="mb-8 p-6 bg-blue-50 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-4 text-blue-800">How to request data deletion</h2>
        <p className="mb-4 leading-relaxed">
          If you want to delete your activities/data for the **leadSync** app, you can do so by following these steps:
        </p>
        <ol className="list-decimal pl-6 space-y-4 mb-4">
          <li>Go to your Facebook Profile&apos;s <strong>Settings &amp; Privacy &gt; Settings</strong>.</li>
          <li>Look for <strong>Apps and Websites</strong> and you will see all of the apps and websites you linked with your Facebook.</li>
          <li>Search and Select <strong>leadSync</strong> in the list.</li>
          <li>Scroll and click <strong>Remove</strong>.</li>
          <li>Alternatively, you can send a direct request to our support team at <span className="font-bold text-blue-700">vitul67142@gmail.com</span> with the subject &quot;Data Deletion Request&quot;. Please include your full name and the email address associated with your lead submission.</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-800 border-b-2 border-blue-100 pb-2">Processing Time</h2>
        <p className="mb-4 leading-relaxed">
          Once a request is received via email, our team will process the deletion of all your personal data from our database within **48 to 72 hours**. You will receive a confirmation email once the process is complete.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-800 border-b-2 border-blue-100 pb-2">What data is deleted?</h2>
        <p className="mb-4 leading-relaxed">
          Upon receiving a valid deletion request, we will permanently remove your name, email, phone number, and any associated lead information from our active LeadSync database and any backup systems.
        </p>
      </section>

      <footer className="mt-12 p-6 bg-gray-50 border-t-4 border-blue-500 text-center">
        <p className="text-lg font-bold text-blue-700 text-center">LeadSync / Realvibe Support</p>
        <p className="mt-4 text-sm text-gray-500">© 2026 Realvibe. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
