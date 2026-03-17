import React from "react";

const PrivacyPolicy = () => {
  const lastUpdated = "March 17, 2026";
  const appName = "Vidiflow";
  const email = "vanshkapadia11@gmail.com";

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-slate-800 dark:text-slate-200">
      <h1 className="text-4xl font-bold mb-4">Vidiflow Privacy Policy</h1>
      <p className="text-sm text-slate-500 mb-8">Last updated: {lastUpdated}</p>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-3">
            1. Information We Collect
          </h2>
          <p className="mb-2">
            We do not collect any personal information unless explicitly
            provided by you. This may include:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <span className="font-bold">Device Information:</span> Model, OS
              version, and unique device identifiers (for app stability).
            </li>
            <li>
              <span className="font-bold">Log Data:</span> IP address and app
              usage statistics (via third-party analytics).
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">2. Use of Information</h2>
          <p>
            The information we collect is used to provide and improve the
            service, troubleshoot bugs, and enhance user experience.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">
            3. Third-Party Services
          </h2>
          <p className="mb-3">
            Our app may use third-party services that collect information used
            to identify you:
          </p>
          <ul className="list-disc pl-6">
            <li>
              <a
                href="https://www.google.com/policies/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Google Play Services
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">4. Data Deletion</h2>
          <p>
            Users can request the deletion of their data by contacting us at{" "}
            <span className="font-medium">{email}</span>. We comply with Google
            Play’s data deletion requirements.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">5. Security</h2>
          <p>
            We value your trust in providing us your Personal Information, thus
            we are striving to use commercially acceptable means of protecting
            it.
          </p>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-semibold mb-3">6. Contact Us</h2>
          <p>
            If you have any questions or suggestions about our Privacy Policy,
            do not hesitate to contact us at:
            <span className="block mt-2 font-bold text-lg">{email}</span>
          </p>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
