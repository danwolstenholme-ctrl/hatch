# Next Steps - HatchIt Launch Plan
**Created:** January 4, 2026
**Status:** Product ready, marketing needs strategy

---

## 🔴 IMMEDIATE (Before Any More Ads)

### 1. ~~Dead Code Cleanup~~ ✅ DONE (4 Jan)
**Status:** Verified - chronosphere/heal/replicator are ACTIVE (used by SectionBuilder, ErrorBoundary, ReplicatorModal)

### 2. Marketing Page Audit (1 hour)
**Why:** Payment links MUST work, redirects MUST be correct
**Pages to verify:**
- [ ] `/` - All pricing CTAs go to correct checkout
- [ ] `/features` - Any CTAs work
- [ ] `/how-it-works` - Flow makes sense
- [ ] `/pricing` (if exists) - Matches homepage
- [ ] `/faq` - No outdated info
- [ ] `/about` - Professional
- [ ] `/manifesto` - On-brand
- [ ] `/terms` - Exists
- [ ] `/privacy` - Exists

**For each page check:**
- Every button/link destination
- Pricing consistency ($19/$49/$199)
- No broken images
- Mobile responsive

### 3. Production Stripe Test (30 mins)
**Why:** Real money must work
**Test flow:**
1. Create test email
2. Go through guest → signup → checkout → post-payment
3. Verify subscription appears in Clerk
4. Verify can deploy
5. Cancel subscription, verify access revoked

---

## 🟡 THIS WEEK (Before Heavy Marketing)

### 4. Marketing Strategy Document
**Current state:** Running Reddit ads without clear strategy
**Need:**
- Target subreddits identified
- Ad copy tested
- Landing page optimized for each audience
- Budget allocation
- Success metrics defined

### 5. Analytics Review
**Questions:**
- Where do users drop off?
- Demo → signup conversion rate?
- Signup → paid conversion rate?
- Which pricing tier converts best?

### 6. SEO Basics
- [ ] Meta descriptions on all pages
- [ ] OG images working
- [ ] robots.txt correct
- [ ] sitemap.xml updated

---

## 🟢 NEXT 2 WEEKS (Growth Phase)

### 7. Content Strategy
- Blog posts targeting keywords
- "Built with HatchIt" showcase
- Tutorial videos (Loom or similar)
- Reddit community engagement (not just ads)

### 8. Feature Polish
- Loading states everywhere
- Error messages helpful
- Empty states guide users
- Onboarding improvements

### 9. Testimonials & Social Proof
- Early user feedback
- Build examples to showcase
- Before/after comparisons

---

## 📊 MARKETING CHANNELS (Priority Order)

### Tier 1: Organic + Community
1. **Reddit** (r/webdev, r/SideProject, r/startups, r/reactjs)
   - Not ads initially - genuine posts showing builds
   - Answer questions, be helpful
   - Share "I built this in 30 seconds" clips

2. **Twitter/X**
   - GIFs of builds happening
   - "From idea to deployed in 60 seconds"
   - Engage with indie hackers

3. **Product Hunt**
   - Plan launch day
   - Prepare assets
   - Line up support

### Tier 2: Paid (After Organic Validated)
1. **Reddit Ads** - Target specific subreddits
2. **Google Ads** - "AI website builder" keywords
3. **Twitter Ads** - Retarget engaged users

---

## 💰 BUDGET ALLOCATION (Suggested)

| Channel | Weekly Budget | Metric to Track |
|---------|---------------|-----------------|
| Reddit Organic | $0 (time only) | Signups from r/ referrer |
| Reddit Ads | $50-100 | CPA (cost per signup) |
| Google Ads | $100-200 | CPA + keyword performance |
| Twitter | $0 initially | Engagement, followers |

**Rule:** Don't scale until CPA < $10 for signups

---

## 📝 AD COPY TEMPLATES

### Reddit (Technical Audience)
```
I built a thing: Describe React components in plain English, get production code in ~15 seconds.

No templates. No drag-drop. Just "A pricing section with 3 tiers and a highlighted middle option" → working code.

Free to try: [link]
```

### Reddit (Non-Technical)
```
I can't code but I needed a website. 

Instead of paying $2000 for a dev, I described what I wanted and got a real React site in under a minute.

Not a Wix template - actual code I own.
```

### Google Ads
- "AI Website Builder - Describe It, Build It"
- "React Sites in Seconds - No Code Needed"
- "From Idea to Deployed in 60 Seconds"

---

## ✅ SUCCESS METRICS

### Week 1
- [ ] 100 demo users
- [ ] 10 signups
- [ ] 1 paying customer
- [ ] CPA established

### Week 2-4
- [ ] 500 demo users
- [ ] 50 signups
- [ ] 5-10 paying customers
- [ ] CPA < $20

### Month 2
- [ ] 2000 demo users
- [ ] 200 signups
- [ ] 20-40 paying customers
- [ ] MRR: $400-800
- [ ] CPA < $15

---

## 🚫 ANTI-PATTERNS (Don't Do These)

1. **Scaling ads before product-market fit** - Burn money
2. **Ignoring conversion data** - Flying blind
3. **Too many channels at once** - Can't optimize
4. **Generic ad copy** - Doesn't resonate
5. **No landing page testing** - Leaving money on table

---

*Review this weekly. Adjust based on data, not feelings.*
