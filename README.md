# NaijaBridge — Social-Impact & Digital Opportunity Platform

A modern, credible, responsive web platform for **NaijaBridge**, a remote-first Nigerian social-impact initiative helping young Nigerians, students, graduates, freelancers, and small business owners access verified opportunities, digital skills, mentorship, and career support.

---

## 🌟 Core Architecture & Technology Stack

- **Frontend**: React 18 with TypeScript and Vite
- **Styling**: Tailwind CSS with an editorial Nigerian design system:
  - *Primary Dark*: Deep Navy (`#0B1F33`)
  - *Accent Green*: Forest / Nigerian Green (`#087F5B`)
  - *Secondary Teal*: Deep Teal (`#0F766E`)
  - *Accent Gold*: Warm Ochre (`#D99A28`)
  - *Neutral Canvas*: Warm Off-White (`#F8F7F2`)
  - *Typography*: Plus Jakarta Sans & Outfit (imported via Google Fonts)
- **Icons**: Lucide React
- **Backend API**: Node.js & Express (`server.ts`) proxying Gemini API calls securely server-side
- **AI Career Assistant**: **BridgeBot**, built on Google Gemini (`gemini-2.5-flash`), with contextual Nigerian career prompts and low-bandwidth fallback responses

---

## 📁 Key Files & How to Update Content

All content, partner placeholders, workshop events, and opportunity listings are centralized in a single, well-documented file so that non-developers can update text easily:

### 1. Centralized Data (`/src/data/mockData.ts`)
- **Impact Stats**: Update `IMPACT_STATS` with verified numbers of people reached, opportunities shared, and states represented.
- **Opportunity Directory**: Add or edit listings in `OPPORTUNITIES` (remote jobs, scholarships, grants, internships, and fellowships).
- **Digital Skill Pathways**: Customize the 8 core tracks in `SKILL_PATHWAYS`.
- **Support Services & Pricing**: Adjust services and pricing in Naira (`₦`) or mark them as free under `SUPPORT_SERVICES`.
- **Workshops & Webinars**: Schedule upcoming masterclasses in `UPCOMING_WORKSHOPS`.
- **Team & Advisory Placeholders**: Replace the founding team placeholders in `TEAM_MEMBERS`.
- **FAQ Items**: Add or edit common questions in `FAQ_ITEMS`.
- **Partner Placeholders**: Update prospective institutional sponsors in `PARTNER_PLACEHOLDERS`.

### 2. WhatsApp Community & Support Links
- Update the default WhatsApp link in `/src/components/Header.tsx`, `/src/components/Footer.tsx`, `/src/pages/HomePage.tsx`, and `/src/pages/CommunityPage.tsx`. Replace `https://wa.me/2348000000000` with your organization's official WhatsApp Community Invite Link.

### 3. Server-Side AI (BridgeBot)
- The server entry point is at `/server.ts`.
- The `/api/chat` route receives user prompts and queries Gemini with system instructions tailored to Nigerian career advising, resume tips, and scholarship essay breakdowns.
- Set `GEMINI_API_KEY` in your `.env` file to enable live Gemini API responses.

---

## 🚀 Running the Project Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

---

## 🛡️ Trust & Verification Principles
- **No Unsolicited Fees**: No opportunity requiring an application fee is ever posted.
- **Data-Conscious**: Designed for fast rendering on mobile devices and variable 3G/4G connections.
- **Actionable Growth**: Helps users through the full loop: *Discover → Learn → Prepare → Connect*.
