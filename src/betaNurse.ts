const assets = "/case-studies/beta-nurse";

const screens = [
  ["Overview", "Make the next visit easy to find", "The dashboard surfaces active requests, upcoming visits, and actions that need attention. A dedicated visit card shows the date, time, location, duration, and nurse assignment, while Request Care remains available for returning families.", "overview", "Family overview with recent requests, upcoming visit details, and quick actions"],
  ["Request Care", "Ask for care in six manageable steps", "The guided flow separates care type, patient, location, schedule, preferences, and review. Progress stays visible, families can book on behalf of someone else, and the review step lets them correct details before submitting.", "request-care", "The first step of the care request flow with care categories and a six-step progress indicator"],
  ["My Care Requests", "Show where each request stands", "Filters help families scan a growing list. Matching means a nurse is still being found; Assigned means a nurse has been identified; Confirmed means the booking has moved to confirmation. Each request also shows the location, time, and duration.", "care-requests", "Care requests list with status filters and matching, assigned, confirmed, and completed requests"],
  ["Care Team", "Put a person behind the assignment", "Nurse cards show verification separately from experience and ratings. Each card links back to the relevant care assignment, so families can connect a nurse’s profile to the visit it belongs to.", "care-team", "Assigned nurse cards with verification, experience, ratings, location, and assignment links"],
  ["Messages", "Keep visit coordination in context", "The inbox keeps conversations with nurses and support together. Thread previews and unread counts help families spot updates, while the conversation makes the participant’s role and visit timing easy to find.", "messages", "Messages inbox showing a conversation about confirming a nurse’s arrival time"],
  ["Payments", "Make charges and receipts easy to reconcile", "The workspace separates paid and outstanding amounts from receipt counts. Each charge shows the service, nurse, amount in naira, status, and request reference, with an export action and payment help available.", "payments", "Payments dashboard with totals, receipt count, payment history, and support guidance"],
] as const;

export const betaNurseProject = {
  id: "beta-nurse",
  title: "Beta Nurse",
  tag: "Product Design / Healthtech",
  year: "2026",
  description: "A home-care portal for families in Nigeria to request care, follow nurse assignments, and manage visits, messages, and payments in one place.",
  image: `${assets}/overview.png`,
  content: `
    <h2>Coordinating home care, one visit at a time</h2>
    <p>Beta Nurse is a home-care coordination portal for families in Nigeria. It brings requests, nurse assignments, visit details, conversations, and payment history into one workspace.</p>
    <h2>Designing for the person who coordinates care</h2>
    <p>The project focuses on the family workspace, from the first care request to the follow-up after a visit.</p>
    <div class="beta-nurse-context">
      <section>
        <h3>The problem</h3>
        <p>A family member arranging care may need to explain a relative’s needs, check whether a nurse has been assigned, and confirm where and when the visit will happen. When those details sit in separate conversations or records, it is easy to mistake a submitted request for a confirmed booking or lose track of a follow-up.</p>
      </section>
      <section>
        <h3>Who it serves</h3>
        <p>The primary user is the family coordinator: the person requesting care and following up on visits. The person receiving care may be someone else. Assigned nurses and operations staff support the workflow through separate workspaces for onboarding, credential review, and matching.</p>
      </section>
      <section>
        <h3>The design approach</h3>
        <p>Organize the workspace around the care request. Capture the information needed for coordination in a guided flow, then give each request a visible status. Use the overview for the next decision and provide dedicated pages for details, conversations, and billing.</p>
      </section>
      <section>
        <h3>Example journey</h3>
        <p>A family member requests elderly care for a relative in Ikeja. They enter the patient, location, and schedule details, check the request while matching is underway, and return once a nurse is assigned. Before the visit, they confirm timing in Messages. Afterward, they can find the charge and receipt in Payments.</p>
      </section>
    </div>
    ${screens.map(([label, title, description, image, alt], index) => `
      <section>
        <h2>${String(index + 1).padStart(2, "0")} / ${label}</h2>
        <h3>${title}</h3>
        <p>${description}</p>
        <figure>
          <img src="${assets}/${image}.png" alt="${alt}" width="1920" height="1440" loading="lazy" decoding="async">
          <figcaption>${alt}.</figcaption>
        </figure>
      </section>
    `).join("")}
  `,
};
