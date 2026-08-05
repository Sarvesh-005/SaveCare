# SaveCare — Luxury Medical Marketing Website Design Specification

## Project Overview
A premium, immersive marketing website for SaveCare Hospital Management System. Separate from the existing admin dashboard. Built with vanilla HTML/CSS/JS for maximum performance and zero dependencies.

## Design Direction: Immersive Clinical Elegance

### Aesthetic Philosophy
- **Trust through refinement** — Every detail signals clinical precision and premium quality
- **Calm confidence** — Deep navy + medical teal palette evokes trust, stability, expertise
- **Purposeful motion** — Animations guide attention, never distract
- **Glassmorphism depth** — Layered transparency creates sophisticated spatial hierarchy

### Typography
- **Display**: Cormorant Garamond (elegant serif) — Headlines, hero text, section titles
- **Body**: DM Sans (clean, highly readable sans-serif) — All UI text, descriptions, forms
- **Scale**: Fluid typography with clamp() for perfect scaling across breakpoints

### Color Palette
| Role | Light Mode | Dark Mode |
|------|------------|-----------|
| Primary Deep Navy | #0B1D3A | #1A1A2E |
| Primary Medical Teal | #009688 | #14B8A6 |
| Teal Light | #E0F2F1 | #0F3D3A |
| Surface White | #FAFAFA | #16171D |
| Surface Elevated | #FFFFFF | #1E1F2E |
| Text Primary | #1A1A2E | #F3F4F6 |
| Text Secondary | #64748B | #9CA3AF |
| Border | #E2E8F0 | #2E303A |
| Accent Gold | #D4A843 | #FBBF24 |
| Error | #DC2626 | #EF4444 |
| Success | #059669 | #10B981 |

### Spacing System
- Base unit: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px
- CSS custom properties for consistency

## Core Sections (All Required)

### 1. Hero Section
- **Full-screen immersive** with subtle gradient mesh background
- **Compelling headline** in Cormorant Garamond, animated line-by-line reveal
- **Subheadline** in DM Sans, faded-in after headline
- **Dual CTAs**: Primary "Start Free Trial" (teal glass button), Secondary "Watch Demo" (outline)
- **Trust indicators**: "Trusted by 500+ hospitals", "HIPAA Compliant", "99.9% Uptime"
- **Floating medical illustration** with subtle parallax on scroll
- **Scroll indicator** with animated arrow

### 2. About Section
- **Asymmetric layout**: Text left, visual right (reversed on mobile)
- **Mission statement** with animated counter statistics
- **Core values** as interactive glass cards (hover: lift + glow)
- **Key metrics**: 500+ hospitals, 50K+ doctors, 10M+ patients, 99.9% uptime

### 3. Services/Features Section
- **6 feature cards** in 3×2 grid (responsive: 2×3, 1×6)
- **Glassmorphism cards** with icon, title, description, "Learn more" link
- **Hover effects**: Card lifts, border glows teal, icon animates
- **Features**: Patient Management, Clinical Workflows, AI-Assisted Diagnosis, Billing & Revenue, Telemedicine, Analytics & Reports

### 4. Portfolio/Projects Showcase
- **Masonry grid** of case studies/project cards
- **Lightbox modal** on click with project details
- **Filter tabs**: All, Hospitals, Clinics, Telemedicine
- **Project cards**: Thumbnail, category badge, title, metrics, "View Case Study"

### 5. Testimonials
- **Auto-rotating carousel** (5s interval) with pause on hover
- **3 visible cards** on desktop, 1 on mobile
- **Card content**: Quote, rating (5 stars), author photo, name, title, hospital
- **Navigation**: Dots + prev/next arrows + keyboard support
- **Swipe support** on touch devices

### 6. Pricing Plans
- **3 tiers**: Starter, Professional, Enterprise
- **Monthly/Annual toggle** with 20% annual discount badge
- **Feature comparison table** (accordion on mobile)
- **Popular badge** on Professional tier
- **CTA buttons**: "Get Started" / "Contact Sales"
- **Money-back guarantee** trust signal

### 7. FAQ Section
- **Accordion-style** with smooth height animations
- **Schema.org FAQPage** markup for SEO
- **Search/filter** functionality
- **Categories**: General, Features, Security, Billing, Implementation
- **12-15 questions** covering top objections

### 8. Team Section
- **Leadership team** (4-6 members)
- **Cards**: Photo, name, title, LinkedIn link, short bio on hover
- **Advisory board** row below (smaller cards, name + title + company)

### 9. Blog/News Section
- **Featured article** (large) + 3 recent articles (cards)
- **Category tags**, read time, publication date
- **"View All Articles" CTA** linking to blog subdomain
- **Newsletter signup** integrated at bottom

### 10. Contact Section
- **Split layout**: Contact info left, form right
- **Form fields**: Name, Email, Organization, Role, Message, reCAPTCHA
- **Real-time validation** with accessible error messages
- **Success toast** on submission
- **Map embed** (Google Maps iframe) below form

### 11. Newsletter Subscription
- **Sticky footer bar** on blog pages, inline in footer
- **Single email field** + "Subscribe" button
- **Privacy policy link** + "No spam, unsubscribe anytime"
- **Success state** with confirmation

### 12. Footer
- **4-column grid**: Brand + social, Product links, Company links, Legal
- **Social icons**: LinkedIn, Twitter, GitHub, YouTube
- **Copyright**, privacy policy, terms of service, cookie policy links
- **Back-to-top button** appears on scroll

## Advanced Features Implementation

### Dark/Light Mode Toggle
- **Persistent** (localStorage + prefers-color-scheme)
- **Smooth transition** (300ms) on all colors
- **Icon**: Sun/moon toggle in header
- **System preference detection** on first visit

### Sticky Navigation
- **Transparent** on hero, **solid + shadow** on scroll
- **Logo**, nav links (smooth scroll), CTA button, theme toggle
- **Mobile hamburger** → full-screen overlay menu
- **Active section highlighting** via IntersectionObserver

### Animated Counters
- **IntersectionObserver** triggered
- **CountUp.js-style** animation (2s duration, easing)
- **Format**: 500+ → counts 0 to 500, 10M+ → counts with "M" suffix

### Interactive Cards
- **Hover**: Transform translateY(-8px), box-shadow increase, border glow
- **Focus-visible**: Outline for keyboard navigation
- **Touch**: Active state on press

### Image Gallery with Lightbox
- **Keyboard navigation** (arrows, ESC to close)
- **Swipe gestures** on mobile
- **Caption support** (title, description)
- **Preload adjacent images**

### Search Functionality
- **Global search** (cmd/ctrl+K) for docs, features, blog
- **Debounced input** (300ms)
- **Results dropdown** with categories
- **Keyboard navigation** (arrows, enter)

### Live Chat Widget Placeholder
- **Fixed bottom-right** launcher button
- **Expandable panel** with welcome message
- **"Chat with sales" / "Chat with support"** options
- **Minimized state** with unread badge

### Appointment Booking Form
- **Multi-step**: Select service → Select date/time → Details → Confirm
- **Calendar integration** (flatpickr-style)
- **Timezone detection**
- **Confirmation email** simulation

### Google Maps Integration
- **Embedded iframe** with SaveCare HQ location
- **Custom marker** with logo
- **Directions link** opens Google Maps

### Back-to-Top Button
- **Appears after 300px scroll**
- **Smooth scroll** to top (800ms)
- **FAB style** with teal background

### Loading Animation
- **Branded loader** (pulse ring + logo)
- **Progressive enhancement** — content visible immediately, loader only on slow connections
- **< 200ms** target removal

### Scroll Progress Indicator
- **Top bar** (3px height, teal gradient)
- **Updates on scroll** via requestAnimationFrame
- **Hidden on mobile** (optional)

### Cookie Consent Banner
- **GDPR/CCPA compliant**
- **Categories**: Necessary, Analytics, Marketing
- **Granular toggles** + "Accept All" / "Reject All"
- **Persistent** (localStorage), re-show after 365 days

### SEO Optimization
- **Semantic HTML5**: header, nav, main, section, article, aside, footer
- **Meta tags**: title, description, OG, Twitter Card, canonical
- **JSON-LD**: Organization, WebSite, SoftwareApplication, FAQPage
- **Sitemap.xml** generation
- **Robots.txt**
- **Structured data** for all sections

### Performance Optimization
- **Critical CSS inlined**
- **Font display: swap** + preload
- **Images**: WebP/AVIF, srcset, sizes, lazy loading
- **Code splitting** (dynamic imports for heavy features)
- **Service worker** for offline caching
- **Resource hints**: preconnect, dns-prefetch
- **Target**: LCP < 2.5s, CLS < 0.1, FID < 100ms

### Secure Forms with Validation
- **Client-side**: Real-time, accessible (aria-live)
- **Server-side ready**: honeypot, CSRF token structure
- **reCAPTCHA v3** integration placeholder
- **Sanitization** on all inputs

### Error Pages
- **404**: Friendly illustration, search link, back home, popular links
- **500**: Apology, status page link, retry button, contact support
- **Consistent branding** with main site

### Favicon & Metadata
- **Favicon set**: 16, 32, 48, 64, 128, 180, 192, 512px
- **Apple touch icon**
- **Manifest.json** for PWA
- **Theme color** meta tags

## Technical Architecture

### File Structure
```
savecare-website/
├── index.html
├── 404.html
├── 500.html
├── manifest.json
├── robots.txt
├── sitemap.xml
├── assets/
│   ├── fonts/
│   ├── images/
│   ├── icons/
│   └── videos/
├── css/
│   ├── variables.css
│   ├── reset.css
│   ├── typography.css
│   ├── layout.css
│   ├── components.css
│   ├── sections/
│   │   ├── hero.css
│   │   ├── about.css
│   │   ├── services.css
│   │   ├── portfolio.css
│   │   ├── testimonials.css
│   │   ├── pricing.css
│   │   ├── faq.css
│   │   ├── team.css
│   │   ├── blog.css
│   │   ├── contact.css
│   │   ├── newsletter.css
│   │   └── footer.css
│   └── utilities.css
├── js/
│   ├── main.js
│   ├── theme.js
│   ├── navigation.js
│   ├── animations.js
│   ├── counters.js
│   ├── carousel.js
│   ├── lightbox.js
│   ├── forms.js
│   ├── search.js
│   ├── chat.js
│   ├── booking.js
│   ├── cookie-consent.js
│   ├── scroll-progress.js
│   └── utils.js
└── components/
    ├── header.html
    ├── footer.html
    └── ...
```

### Browser Support
- **Modern browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **No IE11 support**
- **Graceful degradation** for unsupported features

### Accessibility (WCAG 2.1 AA)
- **Semantic HTML** throughout
- **Color contrast**: 4.5:1 minimum
- **Focus management**: Visible outlines, skip links
- **ARIA labels** where needed
- **Keyboard navigation** for all interactive elements
- **Screen reader** tested
- **Reduced motion** support (prefers-reduced-motion)
- **Alt text** for all images
- **Form labels** properly associated

## Implementation Phases

### Phase 1: Foundation (Week 1)
- Project setup, CSS variables, reset, typography
- Header/navigation with theme toggle
- Footer
- Dark/light mode system

### Phase 2: Core Sections (Week 2)
- Hero, About, Services
- Scroll animations framework
- Counter animations

### Phase 3: Content Sections (Week 3)
- Portfolio, Testimonials, Pricing
- FAQ accordions
- Team section

### Phase 4: Interactive Features (Week 4)
- Blog, Contact form, Newsletter
- Lightbox, Carousel, Search
- Booking form, Chat widget

### Phase 5: Polish & Launch (Week 5)
- Cookie consent, Error pages
- SEO, Performance, Accessibility audit
- Cross-browser testing
- Deployment configuration

## Success Metrics
- **Lighthouse Performance**: > 90
- **Lighthouse Accessibility**: 100
- **Lighthouse Best Practices**: > 90
- **Lighthouse SEO**: 100
- **Core Web Vitals**: All green
- **Cross-browser**: No critical issues
- **Mobile usability**: Perfect score

---

**Approved by**: [User]
**Date**: 2026-08-03
**Version**: 1.0