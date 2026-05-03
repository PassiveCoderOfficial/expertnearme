import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const COUNTRIES = ['sg', 'ae', 'sa', 'bd'];
const COUNTRY_NAMES: Record<string, string> = { sg: 'Singapore', ae: 'UAE', sa: 'Saudi Arabia', bd: 'Bangladesh' };
const COUNTRY_CITIES: Record<string, string[]> = {
  sg: ['Singapore City', 'Orchard', 'Jurong', 'Tampines', 'Woodlands', 'Ang Mo Kio', 'Bedok', 'Bukit Timah'],
  ae: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Al Ain', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'],
  sa: ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Tabuk', 'Abha', 'Yanbu'],
  bd: ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Comilla', 'Mymensingh', 'Barishal'],
};

const CATEGORY_TAGS = [
  'interior-design', 'renovation', 'cleaning', 'it-technology', 'healthcare',
  'education', 'photography', 'events-weddings', 'beauty-wellness', 'legal',
  'automotive', 'food-catering', 'engineering', 'furniture',
];

const CATEGORY_LABELS: Record<string, string> = {
  'interior-design': 'Interior Design',
  'renovation': 'Renovation & Construction',
  'cleaning': 'Cleaning Services',
  'it-technology': 'IT & Technology',
  'healthcare': 'Healthcare & Medical',
  'education': 'Education & Tutoring',
  'photography': 'Photography & Media',
  'events-weddings': 'Events & Weddings',
  'beauty-wellness': 'Beauty & Wellness',
  'legal': 'Legal & Consulting',
  'automotive': 'Automotive',
  'food-catering': 'Food & Catering',
  'engineering': 'Engineering',
  'furniture': 'Furniture & Home Decor',
};

// Blog post templates — [title_fn, content_fn, focusKeyword_fn]
type PostTemplate = {
  titleFn: (cat: string, city: string, country: string) => string;
  contentFn: (cat: string, city: string, country: string, catLabel: string) => string;
  keywordFn: (cat: string, city: string) => string;
};

const TEMPLATES: PostTemplate[] = [
  {
    titleFn: (cat, city) => `How to Find the Best ${CATEGORY_LABELS[cat]} Experts in ${city}`,
    keywordFn: (cat, city) => `${CATEGORY_LABELS[cat]} ${city}`,
    contentFn: (cat, city, country, catLabel) => `<h2>Finding Trusted ${catLabel} Experts in ${city}</h2>
<p>Whether you're a homeowner, business owner, or simply need professional help, finding the right ${catLabel.toLowerCase()} expert in ${city} can be challenging. In this guide, we'll walk you through exactly what to look for, how to compare quotes, and how to avoid common pitfalls.</p>

<h2>Why Local Expertise Matters</h2>
<p>Local ${catLabel.toLowerCase()} professionals in ${city} understand the regional regulations, climate considerations, cultural expectations, and price points specific to ${country}. This knowledge is invaluable when it comes to delivering quality work on time and within budget.</p>

<h2>What to Look for in a ${catLabel} Professional</h2>
<ul>
<li><strong>Verified credentials</strong> — Always check licenses, certifications, and professional memberships</li>
<li><strong>Portfolio and reviews</strong> — A strong track record of completed projects speaks volumes</li>
<li><strong>Clear pricing</strong> — Get itemised quotes, not vague estimates</li>
<li><strong>Communication</strong> — Responsive experts save you stress and time</li>
<li><strong>Insurance</strong> — Protect yourself with insured professionals</li>
</ul>

<h2>How ExpertNear.Me Helps</h2>
<p>ExpertNear.Me is the leading directory for vetted ${catLabel.toLowerCase()} professionals in ${city}, ${country}. Every expert on our platform is verified, reviewed, and ready to take bookings. Browse profiles, compare services, and book directly — no middleman, no hidden fees.</p>

<h2>Questions to Ask Before Hiring</h2>
<ol>
<li>How many years of experience do you have in ${city}?</li>
<li>Can you provide references from recent clients?</li>
<li>What is included in your quoted price?</li>
<li>Are you licensed and insured for work in ${country}?</li>
<li>What is your availability and typical lead time?</li>
</ol>

<h2>Conclusion</h2>
<p>Hiring the right ${catLabel.toLowerCase()} expert in ${city} doesn't have to be stressful. With ExpertNear.Me, you get verified profiles, transparent pricing, and real client reviews — everything you need to make a confident choice. <a href="https://expertnear.me/${country}/${cat}">Browse ${catLabel} experts in ${city} today →</a></p>`,
  },
  {
    titleFn: (cat, city) => `Top ${CATEGORY_LABELS[cat]} Services in ${city} — What You Need to Know`,
    keywordFn: (cat, city) => `best ${CATEGORY_LABELS[cat].toLowerCase()} ${city}`,
    contentFn: (cat, city, country, catLabel) => `<h2>${catLabel} in ${city}: A Complete Overview</h2>
<p>The demand for professional ${catLabel.toLowerCase()} services in ${city} has grown significantly in recent years. As ${country}'s economy expands and standards rise, so does the need for qualified, reliable professionals.</p>

<h2>The Local Market for ${catLabel}</h2>
<p>In ${city}, you'll find a wide range of ${catLabel.toLowerCase()} providers — from solo practitioners to large established firms. Pricing can vary significantly based on experience, location within ${city}, and the complexity of your requirements.</p>

<h2>Average Pricing in ${city}</h2>
<p>Understanding typical price ranges helps you spot fair deals and avoid overcharging. While every project is unique, being informed helps you negotiate confidently and spot red flags.</p>

<h2>How to Compare ${catLabel} Providers</h2>
<p>Don't just compare on price. Look at the full picture: speed of response, quality of previous work, client testimonials, and whether the expert is available in your area of ${city}.</p>

<h2>Red Flags to Watch Out For</h2>
<ul>
<li>No verifiable reviews or portfolio</li>
<li>Refusal to provide written quotes</li>
<li>Pressure to pay large deposits upfront</li>
<li>No business registration or license</li>
<li>Unavailable or slow to respond</li>
</ul>

<h2>Find Verified ${catLabel} Experts on ExpertNear.Me</h2>
<p>ExpertNear.Me lists only verified, reviewed ${catLabel.toLowerCase()} professionals in ${city}. Compare profiles, read real reviews, and book instantly. <a href="https://expertnear.me/${country}/${cat}">Start your search →</a></p>`,
  },
  {
    titleFn: (cat, city) => `${CATEGORY_LABELS[cat]} Near Me: Experts Available in ${city}`,
    keywordFn: (cat, city) => `${CATEGORY_LABELS[cat].toLowerCase()} near me ${city}`,
    contentFn: (cat, city, country, catLabel) => `<h2>Looking for ${catLabel} Near You in ${city}?</h2>
<p>If you've been searching for "${catLabel.toLowerCase()} near me" in ${city}, you've come to the right place. ExpertNear.Me connects you with the top-rated local ${catLabel.toLowerCase()} professionals in your area — fast, reliable, and fully verified.</p>

<h2>Why "Near Me" Matters for ${catLabel}</h2>
<p>Hiring locally in ${city} means faster response times, lower travel charges, and a professional who understands the local context. Whether you need someone same-day or you're planning ahead, local experts deliver better outcomes.</p>

<h2>How to Search for ${catLabel} in ${city}</h2>
<p>On ExpertNear.Me, simply select ${country} and browse the ${catLabel} category. You can filter by location, rating, price range, and availability. Every profile shows real reviews from verified clients in ${city}.</p>

<h2>What Makes a Great Local ${catLabel} Expert?</h2>
<ul>
<li>Familiar with ${city} regulations and standards</li>
<li>Available in your specific neighbourhood or district</li>
<li>Responsive and professional in communication</li>
<li>Transparent, itemised pricing</li>
<li>Strong local reputation and reviews</li>
</ul>

<h2>Book a ${catLabel} Expert in ${city} Today</h2>
<p>Stop scrolling through unverified listings. ExpertNear.Me makes it easy to find and book trusted ${catLabel.toLowerCase()} experts near you in ${city}. <a href="https://expertnear.me/${country}/${cat}">View available experts →</a></p>`,
  },
  {
    titleFn: (cat, city) => `${city} ${CATEGORY_LABELS[cat]} Guide: Prices, Tips & Best Experts`,
    keywordFn: (cat, city) => `${city} ${CATEGORY_LABELS[cat].toLowerCase()} guide`,
    contentFn: (cat, city, country, catLabel) => `<h2>The Complete Guide to ${catLabel} in ${city}</h2>
<p>This guide covers everything you need to know about hiring ${catLabel.toLowerCase()} professionals in ${city}, ${country} — from understanding the market to finding the right expert for your needs and budget.</p>

<h2>Understanding the ${catLabel} Market in ${city}</h2>
<p>${city} has a vibrant and competitive ${catLabel.toLowerCase()} sector. With a growing middle class and rising quality standards, professionals here are increasingly skilled and competitive. However, quality varies widely, which is why vetting is essential.</p>

<h2>Typical ${catLabel} Pricing in ${city}</h2>
<p>Prices for ${catLabel.toLowerCase()} services in ${city} vary based on scope, materials, and the professional's experience level. Always request at least 2-3 quotes to establish a fair market range before committing.</p>

<h2>Step-by-Step: How to Hire a ${catLabel} Expert in ${city}</h2>
<ol>
<li>Define your project scope and requirements clearly</li>
<li>Search ExpertNear.Me for verified ${catLabel.toLowerCase()} experts in ${city}</li>
<li>Compare 3-5 profiles based on reviews, portfolio, and pricing</li>
<li>Request quotes and ask clarifying questions</li>
<li>Check references and confirm licensing</li>
<li>Book through ExpertNear.Me for protection and convenience</li>
</ol>

<h2>Best Neighbourhoods in ${city} for ${catLabel} Services</h2>
<p>Top ${catLabel.toLowerCase()} experts in ${city} cover all major areas. Whether you're in the city centre or the suburbs, you'll find qualified professionals on ExpertNear.Me.</p>

<h2>Start Your Search Now</h2>
<p>Ready to hire? <a href="https://expertnear.me/${country}/${cat}">Browse ${catLabel} experts in ${city} on ExpertNear.Me →</a></p>`,
  },
  {
    titleFn: (cat, city) => `Why You Should Hire a Professional ${CATEGORY_LABELS[cat]} Expert in ${city}`,
    keywordFn: (cat, city) => `hire ${CATEGORY_LABELS[cat].toLowerCase()} ${city}`,
    contentFn: (cat, city, country, catLabel) => `<h2>The Case for Professional ${catLabel} in ${city}</h2>
<p>Many people in ${city} attempt to handle ${catLabel.toLowerCase()} needs themselves or hire unverified individuals to save money. While this might seem cost-effective in the short term, the risks often outweigh the savings.</p>

<h2>The Real Cost of Going Unprofessional</h2>
<p>Amateur ${catLabel.toLowerCase()} work in ${city} can lead to costly mistakes, safety risks, failed inspections, and expensive rework. A professional does it right the first time — saving you time, money, and stress.</p>

<h2>Benefits of Hiring a Verified ${catLabel} Expert</h2>
<ul>
<li><strong>Quality guarantee</strong> — Professionals stand behind their work</li>
<li><strong>Regulatory compliance</strong> — They know ${country} standards and codes</li>
<li><strong>Proper tools and materials</strong> — Right equipment for the job</li>
<li><strong>Time efficiency</strong> — Faster completion with expert knowledge</li>
<li><strong>Peace of mind</strong> — Verified, insured, and accountable</li>
</ul>

<h2>How ExpertNear.Me Verifies ${catLabel} Experts in ${city}</h2>
<p>Every ${catLabel.toLowerCase()} expert on ExpertNear.Me goes through a verification process that includes credential checks, portfolio review, and client testimonial validation. You only see real professionals who deliver real results.</p>

<h2>Get Started Today</h2>
<p>Don't compromise on quality. Find a verified ${catLabel.toLowerCase()} expert in ${city} on ExpertNear.Me and get the professional service you deserve. <a href="https://expertnear.me/${country}/${cat}">Browse experts →</a></p>`,
  },
];

const BUYER_TEMPLATES: PostTemplate[] = [
  {
    titleFn: (_, city) => `How to Find Local Services in ${city} Without the Stress`,
    keywordFn: (_, city) => `local services ${city}`,
    contentFn: (_, city, country) => `<h2>The Easiest Way to Find Local Services in ${city}</h2>
<p>Looking for reliable local services in ${city}, ${country}? Whether it's a plumber, interior designer, tutor, or event planner — finding someone you can trust can feel overwhelming. ExpertNear.Me changes that.</p>
<h2>Why Local Matters</h2>
<p>Hiring local in ${city} means faster service, better communication, and professionals who understand your neighbourhood, culture, and standards.</p>
<h2>How ExpertNear.Me Works</h2>
<p>Browse thousands of verified local service providers in ${city}. Compare profiles, read real reviews, and book instantly — all in one place.</p>
<p><a href="https://expertnear.me/${country}">Find local experts in ${city} →</a></p>`,
  },
  {
    titleFn: (_, city) => `${city} Home Services: Your Complete Hiring Guide`,
    keywordFn: (_, city) => `home services ${city}`,
    contentFn: (_, city, country) => `<h2>Home Services in ${city}: What You Need to Know</h2>
<p>From renovations to cleaning to electrical work, hiring the right home service professional in ${city} can transform your living space. This guide covers everything you need.</p>
<h2>Most In-Demand Home Services in ${city}</h2>
<ul><li>Interior Design</li><li>Renovation & Construction</li><li>Cleaning Services</li><li>Electrical & Engineering</li><li>Furniture & Home Decor</li></ul>
<h2>Find Them All on ExpertNear.Me</h2>
<p><a href="https://expertnear.me/${country}">Browse home service experts in ${city} →</a></p>`,
  },
];

const EXPERT_TEMPLATES: PostTemplate[] = [
  {
    titleFn: (cat) => `How to Grow Your ${CATEGORY_LABELS[cat]} Business Online`,
    keywordFn: (cat) => `grow ${CATEGORY_LABELS[cat].toLowerCase()} business`,
    contentFn: (cat, _, country, catLabel) => `<h2>Grow Your ${catLabel} Business with Online Exposure</h2>
<p>In today's digital-first world, ${catLabel.toLowerCase()} professionals who invest in their online presence win more clients and build stronger reputations. Here's how to get started.</p>
<h2>The Power of a Strong Online Profile</h2>
<p>Potential clients search online before they call. A professional listing on ExpertNear.Me puts you in front of buyers who are actively looking for ${catLabel.toLowerCase()} services in ${country}.</p>
<h2>Key Elements of a Great ${catLabel} Profile</h2>
<ul>
<li>Professional photo and bio</li>
<li>Detailed service list with pricing</li>
<li>Portfolio showcasing your best work</li>
<li>Genuine client reviews</li>
<li>Fast response to booking requests</li>
</ul>
<h2>List Your ${catLabel} Business on ExpertNear.Me</h2>
<p>Join hundreds of ${catLabel.toLowerCase()} professionals already growing their business on ExpertNear.Me. <a href="https://expertnear.me/pricing">See our plans →</a></p>`,
  },
  {
    titleFn: (cat) => `Why ${CATEGORY_LABELS[cat]} Experts Are Choosing ExpertNear.Me`,
    keywordFn: (cat) => `${CATEGORY_LABELS[cat].toLowerCase()} directory listing`,
    contentFn: (cat, _, __, catLabel) => `<h2>Join the Growing Community of ${catLabel} Experts on ExpertNear.Me</h2>
<p>Thousands of ${catLabel.toLowerCase()} professionals are already using ExpertNear.Me to connect with qualified buyers, manage bookings, and grow their reputation. Here's why they love it.</p>
<h2>What Experts Say</h2>
<ul>
<li>"My bookings doubled within 3 months of listing."</li>
<li>"Clients come to me already informed and ready — no more time-wasters."</li>
<li>"The platform is incredibly easy to use and my profile looks professional."</li>
</ul>
<h2>The Founding Expert Opportunity</h2>
<p>Right now, ExpertNear.Me is offering a Lifetime Deal for founding experts — lock in all features forever for a single one-time payment. Only 500 spots available. <a href="https://expertnear.me/pricing">Claim your spot →</a></p>`,
  },
];

interface PostSpec {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  countryCode: string | null;
  categoryTag: string | null;
  focusKeyword: string;
  metaTitle: string;
  metaDesc: string;
  tags: string;
  authorName: string;
  readingTimeMins: number;
}

function generatePosts(): PostSpec[] {
  const posts: PostSpec[] = [];
  const seenSlugs = new Set<string>();

  function addPost(spec: PostSpec) {
    let slug = spec.slug;
    let counter = 1;
    while (seenSlugs.has(slug)) { slug = `${spec.slug}-${counter++}`; }
    seenSlugs.add(slug);
    posts.push({ ...spec, slug });
  }

  // Category × Country × City × Template posts = bulk of the 1000
  for (const country of COUNTRIES) {
    const cities = COUNTRY_CITIES[country];
    const countryName = COUNTRY_NAMES[country];

    for (const cat of CATEGORY_TAGS) {
      const catLabel = CATEGORY_LABELS[cat];

      // 1 post per template per top 3 cities per country per category = 4×14×3×5 = 840
      for (const city of cities.slice(0, 3)) {
        for (const tpl of TEMPLATES) {
          const title = tpl.titleFn(cat, city, countryName);
          const content = tpl.contentFn(cat, city, country, catLabel);
          const keyword = tpl.keywordFn(cat, city);
          const wordCount = content.replace(/<[^>]+>/g, '').split(/\s+/).length;
          addPost({
            title,
            slug: slugify(title),
            excerpt: `Find the best ${catLabel.toLowerCase()} experts in ${city}, ${countryName}. Compare profiles, read reviews, and book instantly on ExpertNear.Me.`,
            content,
            countryCode: country,
            categoryTag: cat,
            focusKeyword: keyword,
            metaTitle: `${title} | ExpertNear.Me`,
            metaDesc: `Looking for trusted ${catLabel.toLowerCase()} in ${city}? ExpertNear.Me connects you with verified local experts in ${countryName}. Compare, review, book.`,
            tags: `${catLabel.toLowerCase()}, ${city.toLowerCase()}, ${countryName.toLowerCase()}, local experts`,
            authorName: 'ExpertNear.Me Team',
            readingTimeMins: Math.max(3, Math.ceil(wordCount / 200)),
          });
        }
      }
    }
  }

  // Buyer-focused posts — city × template
  for (const country of COUNTRIES) {
    const cities = COUNTRY_CITIES[country];
    const countryName = COUNTRY_NAMES[country];
    for (const city of cities) {
      for (const tpl of BUYER_TEMPLATES) {
        const title = tpl.titleFn('', city, countryName);
        const content = tpl.contentFn('', city, country, '');
        addPost({
          title, slug: slugify(title),
          excerpt: `Discover the easiest way to find and hire local service experts in ${city}, ${countryName}.`,
          content, countryCode: country, categoryTag: null,
          focusKeyword: tpl.keywordFn('', city),
          metaTitle: `${title} | ExpertNear.Me`,
          metaDesc: `Find trusted local services in ${city}. Verified professionals, real reviews. ExpertNear.Me.`,
          tags: `local services, ${city.toLowerCase()}, ${countryName.toLowerCase()}`,
          authorName: 'ExpertNear.Me Team',
          readingTimeMins: 3,
        });
      }
    }
  }

  // Expert-acquisition posts — category × template
  for (const cat of CATEGORY_TAGS) {
    for (const tpl of EXPERT_TEMPLATES) {
      const title = tpl.titleFn(cat, '', '');
      const content = tpl.contentFn(cat, '', '', CATEGORY_LABELS[cat]);
      addPost({
        title, slug: slugify(title),
        excerpt: `Grow your ${CATEGORY_LABELS[cat].toLowerCase()} business online. Join ExpertNear.Me and reach more clients.`,
        content, countryCode: null, categoryTag: cat,
        focusKeyword: tpl.keywordFn(cat, ''),
        metaTitle: `${title} | ExpertNear.Me for Experts`,
        metaDesc: `${CATEGORY_LABELS[cat]} professionals — list on ExpertNear.Me and grow your client base. Lifetime deal available.`,
        tags: `${CATEGORY_LABELS[cat].toLowerCase()}, expert listing, local business, ExpertNear.Me`,
        authorName: 'ExpertNear.Me Team',
        readingTimeMins: 4,
      });
    }
  }

  return posts.slice(0, 1000);
}

async function main() {
  console.log('📝 Generating 1000 blog posts...');
  const posts = generatePosts();
  console.log(`   Generated ${posts.length} unique posts`);

  // Clear existing blog posts
  await prisma.blogPost.deleteMany({});
  console.log('   Cleared existing posts');

  const now = new Date('2026-05-03T00:00:00Z');
  // 50 already published (backdated), rest scheduled at 90min intervals starting from now+1hr
  let scheduledCount = 0;
  let publishedCount = 0;

  const batchSize = 50;
  for (let i = 0; i < posts.length; i += batchSize) {
    const batch = posts.slice(i, i + batchSize);
    await prisma.blogPost.createMany({
      data: batch.map((p, batchIdx) => {
        const globalIdx = i + batchIdx;

        if (globalIdx < 50) {
          // Published — backdated by (50 - globalIdx) days
          publishedCount++;
          const pubDate = new Date(now);
          pubDate.setDate(pubDate.getDate() - (50 - globalIdx));
          return {
            ...p,
            status: 'PUBLISHED' as const,
            publishedAt: pubDate,
            scheduledAt: null,
            noIndex: false,
          };
        } else {
          // Scheduled — 90 min intervals starting 1 hour from now
          scheduledCount++;
          const schedDate = new Date(now);
          schedDate.setMinutes(schedDate.getMinutes() + 60 + (globalIdx - 50) * 90);
          return {
            ...p,
            status: 'SCHEDULED' as const,
            publishedAt: null,
            scheduledAt: schedDate,
            noIndex: false,
          };
        }
      }),
      skipDuplicates: true,
    });

    const pct = Math.round(((i + batch.length) / posts.length) * 100);
    process.stdout.write(`\r   Seeded ${i + batch.length}/${posts.length} posts (${pct}%)`);
  }

  console.log(`\n\n✅ Blog seed complete!`);
  console.log(`   Published  : ${publishedCount}`);
  console.log(`   Scheduled  : ${scheduledCount}`);

  // Show schedule span
  const lastPost = posts[posts.length - 1];
  const lastSchedule = new Date(now);
  lastSchedule.setMinutes(lastSchedule.getMinutes() + 60 + (posts.length - 50 - 1) * 90);
  const daysUntilLast = Math.round((lastSchedule.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  console.log(`   Last post scheduled: ${lastSchedule.toDateString()} (~${daysUntilLast} days from now)`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
