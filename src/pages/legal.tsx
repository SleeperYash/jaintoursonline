import { Link } from "react-router-dom";
import LegalPage from "@/components/site/LegalPage";
import { BRAND } from "@/lib/brand";
import { openCookiePreferences } from "@/lib/consent";

const UPDATED = "25 September 2026";
const mail = <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>;

export const Privacy = () => (
  <LegalPage title="Privacy Policy" crumb="Privacy" path="/privacy" updated={UPDATED}
    description="How Jain Tours & Travels collects, uses and protects your personal data, including our DPDP Act notice and Grievance Officer details."
    sections={[
      { title: "Who we are", body: <p>{BRAND.name} ("we", "us") is a travel agency located at {BRAND.address}. This policy explains how we handle your personal data when you use our website or contact us.</p> },
      { title: "Data we collect", body: <ul>
        <li>Details you submit in enquiry or download forms: name, phone, email, and optional trip preferences (destination, dates, travellers, budget, message).</li>
        <li>Booking documents you share with us (e.g. passport or ID copies) only when needed for bookings or visas.</li>
        <li>Anonymous usage statistics via Google Analytics — only if you accept analytics cookies.</li>
      </ul> },
      { title: "How we use it", body: <ul>
        <li>To respond to your enquiry by call, WhatsApp or email and to plan and book your trip.</li>
        <li>To meet legal, tax and regulatory obligations.</li>
        <li>To improve our website (analytics, with consent).</li>
      </ul> },
      { title: "Sharing", body: <p>We never sell your data. We share only what is necessary with airlines, hotels, cruise lines, visa authorities, insurers and tour partners to fulfil your booking, and with trusted service providers (secure hosting, spreadsheets, analytics) who process data on our behalf.</p> },
      { title: "Retention", body: <p>Enquiry data is kept for up to 24 months after our last contact, and booking records as long as required by law. After that it is deleted or anonymised.</p> },
      { title: "Cookies", body: <p>See our <Link to="/cookies">Cookie Policy</Link>. You can change your choice any time.</p> },
      { title: "DPDP Act Notice (India)", body: <>
        <p>Under the Digital Personal Data Protection Act, 2023, {BRAND.name} is the Data Fiduciary for the personal data you share with us. We process it only for the purposes stated above, based on your consent or legitimate uses permitted by law.</p>
        <p>You have the right to:</p>
        <ul>
          <li>Access a summary of your personal data and how it is processed.</li>
          <li>Request correction, completion, updating or erasure of your data.</li>
          <li>Withdraw consent at any time (this won't affect processing already done).</li>
          <li>Nominate another person to exercise your rights in case of death or incapacity.</li>
          <li>Raise a grievance with us, and escalate to the Data Protection Board of India if unresolved.</li>
        </ul>
        <p><strong>Grievance Officer</strong><br />Name: Dinesh Jain<br />Email: {mail}<br />Phone: {BRAND.phoneDisplay}<br />Address: {BRAND.address}</p>
        <p>We aim to respond to all requests within 30 days.</p>
      </> },
      { title: "Security", body: <p>We use reasonable technical and organisational safeguards, including encrypted connections and restricted access, to protect your data.</p> },
      { title: "Contact", body: <p>Questions about this policy? Email {mail}.</p> },
    ]} />
);

export const Terms = () => (
  <LegalPage title="Terms & Conditions" crumb="Terms" path="/terms" updated={UPDATED}
    description="Terms and conditions for bookings, payments and travel services with Jain Tours & Travels, Mumbai."
    sections={[
      { title: "Acceptance", body: <p>By using this website or booking with {BRAND.name}, you agree to these terms.</p> },
      { title: "Our role", body: <p>We act as an agent for airlines, hotels, cruise lines, transport and tour operators. Their own terms also apply, and we are not liable for their acts, omissions, delays or schedule changes.</p> },
      { title: "Quotes & prices", body: <p>Prices shown on the website ("starting from") are indicative and subject to availability, season, exchange rates and taxes. A booking is confirmed only after written confirmation and receipt of payment.</p> },
      { title: "Payments", body: <p>An advance is required to confirm bookings, with the balance due before travel as communicated in your quote. Non-payment may lead to cancellation.</p> },
      { title: "Travel documents", body: <p>You are responsible for valid passports, visas, health requirements and insurance. Visa approval is at the sole discretion of the relevant embassy; we cannot guarantee outcomes.</p> },
      { title: "Changes & cancellations", body: <p>See our <Link to="/refund-policy">Cancellation & Refund Policy</Link>.</p> },
      { title: "Liability", body: <p>We are not liable for losses caused by events beyond our control, including natural disasters, strikes, pandemics, government action or supplier failure. Travel insurance is strongly recommended.</p> },
      { title: "Website content", body: <p>Content and images are for information only and may belong to their respective owners. Please don't copy them without permission.</p> },
      { title: "Governing law", body: <p>These terms are governed by the laws of India, with courts in Mumbai having exclusive jurisdiction.</p> },
      { title: "Contact", body: <p>{mail} · {BRAND.phoneDisplay}</p> },
    ]} />
);

export const RefundPolicy = () => (
  <LegalPage title="Cancellation & Refund Policy" crumb="Refund Policy" path="/refund-policy" updated={UPDATED}
    description="Cancellation charges and refund timelines for tour packages, flights, hotels and visas booked with Jain Tours & Travels."
    sections={[
      { title: "How to cancel", body: <p>Cancellations must be requested in writing to {mail} or on WhatsApp at {BRAND.phoneDisplay}. The date we receive your request is the cancellation date.</p> },
      { title: "Tour packages", body: <><p>Unless your quote states otherwise, these charges apply per person:</p><ul>
        <li>45+ days before departure: booking advance retained</li>
        <li>30–44 days: 25% of package cost</li>
        <li>15–29 days: 50% of package cost</li>
        <li>Less than 15 days or no-show: 100% of package cost</li>
      </ul></> },
      { title: "Flights, cruises & hotels", body: <p>These follow the fare rules of the airline, cruise line or hotel. Non-refundable fares and peak-season bookings may not be refunded.</p> },
      { title: "Visa & service fees", body: <p>Visa fees, insurance premiums and our service charges are non-refundable once processed.</p> },
      { title: "Refunds", body: <p>Eligible refunds are processed to the original payment method within 7–21 working days after we receive the amount from suppliers.</p> },
      { title: "Changes by us", body: <p>If we must cancel a trip, you can choose an alternative or a full refund of amounts received for the unused services.</p> },
    ]} />
);

export const CookiePolicy = () => (
  <LegalPage title="Cookie Policy" crumb="Cookies" path="/cookies" updated={UPDATED}
    description="Which cookies Jain Tours & Travels uses and how to manage your preferences."
    sections={[
      { title: "What are cookies", body: <p>Cookies and similar storage are small files saved in your browser to make a website work and to understand how it's used.</p> },
      { title: "Cookies we use", body: <ul>
        <li><strong>Essential</strong> — remember your cookie choice, theme and form details you've already shared. Always on.</li>
        <li><strong>Analytics</strong> — Google Analytics, to count visits and improve the site. Only set after you click Accept.</li>
      </ul> },
      { title: "Third-party content", body: <p>Embedded Google Maps and links to Instagram, YouTube and WhatsApp may set their own cookies when you use them.</p> },
      { title: "Manage your choice", body: <p><button type="button" onClick={openCookiePreferences} className="underline text-foreground">Open cookie preferences</button> — or clear your browser storage at any time.</p> },
    ]} />
);
