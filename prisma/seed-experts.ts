/**
 * Seed: dummy experts + pricing plans
 * Run: npx tsx prisma/seed-experts.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Profile picture placeholder — orange avatar with initials */
function avatar(name: string) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=f97316&color=fff&size=200&bold=true`;
}

// ─── Pricing plans ────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: "Free",
    description: "Basic listing to get started. No credit card needed.",
    price: 0,
    currency: "USD",
    duration: 36500,
    features: JSON.stringify(["1 country", "1 category", "5 portfolio images", "Basic profile"]),
    active: true,
    featured: false,
  },
  {
    name: "Pro Monthly",
    description: "Full platform access billed monthly.",
    price: 99,
    currency: "USD",
    duration: 30,
    features: JSON.stringify(["Unlimited countries", "Unlimited categories", "Priority in search", "All future features", "Analytics"]),
    active: false,
    featured: false,
  },
  {
    name: "Pro Yearly",
    description: "Full platform access billed yearly — best value.",
    price: 499,
    currency: "USD",
    duration: 365,
    features: JSON.stringify(["Unlimited countries", "Unlimited categories", "Priority in search", "All future features", "Analytics", "2 months free"]),
    active: false,
    featured: true,
  },
  {
    name: "Founding Expert",
    description: "One-time lifetime access. Limited to 500 spots before Aug 16, 2026.",
    price: 999,
    currency: "USD",
    duration: -1,
    features: JSON.stringify(["Lifetime access", "Gold founding badge", "Hall of Fame listing", "Priority in search", "Price locked forever", "All future Pro features"]),
    active: true,
    featured: true,
  },
];

// ─── Expert definitions ───────────────────────────────────────────────────────

interface ExpertDef {
  country: string;
  name: string;
  businessName?: string;
  email: string;
  phone: string;
  whatsapp?: string;
  isBusiness: boolean;
  bio: string;
  shortDesc: string;
  officeAddress: string;
  webAddress?: string;
  lat: number;
  lng: number;
  categorySlugSuffix: string; // slug without country code suffix
  extraCategorySlugSuffix?: string;
  verified: boolean;
  featured: boolean;
  mapFeatured: boolean;
  homeFeatured: boolean;
  foundingExpert: boolean;
}

const EXPERTS: ExpertDef[] = [
  // ── Bangladesh (Dhaka) ──────────────────────────────────────────────────
  {
    country: "bd",
    name: "Rahim Ahmed",
    businessName: "AhmedTech Solutions",
    email: "rahim@ahmedtech.bd",
    phone: "+8801711234567",
    whatsapp: "+8801711234567",
    isBusiness: true,
    bio: "AhmedTech Solutions has been delivering enterprise software, web applications, and IT consulting services across Bangladesh since 2018. Our team of 12 engineers specialises in React, Next.js, Node.js, and cloud deployments on AWS and GCP.",
    shortDesc: "Full-stack web development & IT consulting in Dhaka.",
    officeAddress: "House 12, Road 4, Dhanmondi, Dhaka 1205, Bangladesh",
    webAddress: "https://ahmedtech.bd",
    lat: 23.748,
    lng: 90.378,
    categorySlugSuffix: "it-technology",
    verified: true,
    featured: true,
    mapFeatured: true,
    homeFeatured: true,
    foundingExpert: true,
  },
  {
    country: "bd",
    name: "Nusrat Jahan",
    businessName: "Nusrat Interior Studio",
    email: "nusrat@interiorstudio.bd",
    phone: "+8801812345678",
    isBusiness: true,
    bio: "Nusrat Interior Studio transforms residential and commercial spaces across Dhaka. With over 8 years of experience and 200+ completed projects, we offer full turnkey interior design, 3D visualisation, and furniture procurement.",
    shortDesc: "Award-winning interior design studio in Dhaka.",
    officeAddress: "Flat 3B, Gulshan Avenue, Gulshan-1, Dhaka 1212",
    lat: 23.792,
    lng: 90.414,
    categorySlugSuffix: "interior-design",
    verified: true,
    featured: true,
    mapFeatured: true,
    homeFeatured: false,
    foundingExpert: true,
  },
  {
    country: "bd",
    name: "Dr. Kamal Hossain",
    email: "drkamal@medicarebd.com",
    phone: "+8801955667788",
    isBusiness: false,
    bio: "MBBS (Dhaka Medical College), FCPS (Medicine). Senior Consultant in General Medicine with 15 years of clinical practice. Offering in-person and teleconsultation services.",
    shortDesc: "FCPS General Physician — teleconsultation available.",
    officeAddress: "LabAid Hospital, House 6, Road 4, Dhanmondi, Dhaka",
    lat: 23.739,
    lng: 90.369,
    categorySlugSuffix: "healthcare-medical",
    verified: true,
    featured: false,
    mapFeatured: true,
    homeFeatured: false,
    foundingExpert: false,
  },
  {
    country: "bd",
    name: "Sadia Renovation",
    businessName: "Sadia Build & Renovate",
    email: "sadia@sadiarenovation.bd",
    phone: "+8801611223344",
    isBusiness: true,
    bio: "Sadia Build & Renovate handles complete residential and commercial renovations across greater Dhaka. Licensed civil engineering team, on-time delivery guarantee.",
    shortDesc: "Licensed renovation contractor — Dhaka metro area.",
    officeAddress: "Plot 45, Mirpur-10, Dhaka 1216",
    lat: 23.806,
    lng: 90.360,
    categorySlugSuffix: "renovation-construction",
    verified: true,
    featured: false,
    mapFeatured: false,
    homeFeatured: false,
    foundingExpert: false,
  },
  {
    country: "bd",
    name: "Tariq Education Hub",
    businessName: "Tariq Education Hub",
    email: "info@tariqedu.bd",
    phone: "+8801733445566",
    isBusiness: true,
    bio: "Private tutoring centre specialising in O/A-level, SSC, HSC, and university-level mathematics, physics, and English. 500+ students enrolled since 2020.",
    shortDesc: "Top-rated O/A-level tutoring centre in Uttara.",
    officeAddress: "House 7, Sector 4, Uttara, Dhaka 1230",
    lat: 23.868,
    lng: 90.398,
    categorySlugSuffix: "education-tutoring",
    verified: true,
    featured: false,
    mapFeatured: true,
    homeFeatured: false,
    foundingExpert: false,
  },

  // ── UAE (Dubai / Abu Dhabi) ────────────────────────────────────────────
  {
    country: "ae",
    name: "Mohammed Al Rashid",
    businessName: "Gulf IT Consultants",
    email: "m.rashid@gulfitconsult.ae",
    phone: "+97150123456",
    whatsapp: "+97150123456",
    isBusiness: true,
    bio: "Gulf IT Consultants provides enterprise IT strategy, cybersecurity assessments, ERP implementation, and managed IT services to SMEs and large corporations across the UAE. Microsoft Gold Partner.",
    shortDesc: "Microsoft Gold Partner — IT consulting across the UAE.",
    officeAddress: "Office 1204, Jumeirah Business Centre 1, JLT, Dubai",
    webAddress: "https://gulfitconsult.ae",
    lat: 25.074,
    lng: 55.143,
    categorySlugSuffix: "it-technology",
    verified: true,
    featured: true,
    mapFeatured: true,
    homeFeatured: true,
    foundingExpert: true,
  },
  {
    country: "ae",
    name: "Fatima Al Zaabi",
    businessName: "Emirates Legal Group",
    email: "fatima@emirateslegal.ae",
    phone: "+97142345678",
    isBusiness: true,
    bio: "Emirates Legal Group is a full-service law firm registered with the Dubai Legal Affairs Department. We handle commercial contracts, labour disputes, real estate transactions, and corporate structuring.",
    shortDesc: "DIFC-registered law firm — commercial & real estate law.",
    officeAddress: "Suite 801, ICD Brookfield Place, DIFC, Dubai",
    webAddress: "https://emirateslegal.ae",
    lat: 25.212,
    lng: 55.280,
    categorySlugSuffix: "legal-consulting",
    verified: true,
    featured: true,
    mapFeatured: true,
    homeFeatured: false,
    foundingExpert: true,
  },
  {
    country: "ae",
    name: "CleanPro Dubai",
    businessName: "CleanPro Services LLC",
    email: "ops@cleanprodubai.ae",
    phone: "+97156789012",
    isBusiness: true,
    bio: "ISO-certified cleaning company serving residential, commercial, and industrial clients across Dubai and Sharjah. Deep cleaning, move-in/move-out, sofa & carpet steam cleaning.",
    shortDesc: "ISO-certified deep cleaning — Dubai & Sharjah.",
    officeAddress: "Warehouse 12, Al Quoz Industrial Area 4, Dubai",
    lat: 25.131,
    lng: 55.218,
    categorySlugSuffix: "cleaning-services",
    verified: true,
    featured: false,
    mapFeatured: true,
    homeFeatured: false,
    foundingExpert: false,
  },
  {
    country: "ae",
    name: "Gulf Engineering Solutions",
    businessName: "Gulf Engineering Solutions FZE",
    email: "info@gulfengineering.ae",
    phone: "+97143456789",
    isBusiness: true,
    bio: "MEP engineering firm specialising in mechanical, electrical, and plumbing system design and installation for commercial and hospitality projects in the UAE. 15+ years, 300+ projects delivered.",
    shortDesc: "MEP engineering design & installation — UAE-wide.",
    officeAddress: "Office 412, Business Bay Executive Tower D, Dubai",
    lat: 25.186,
    lng: 55.264,
    categorySlugSuffix: "engineering",
    extraCategorySlugSuffix: "renovation-construction",
    verified: true,
    featured: false,
    mapFeatured: false,
    homeFeatured: false,
    foundingExpert: false,
  },
  {
    country: "ae",
    name: "Abu Dhabi Healthcare Centre",
    businessName: "Al Noor Healthcare",
    email: "appointments@alnoorhc.ae",
    phone: "+97126543210",
    whatsapp: "+97126543210",
    isBusiness: true,
    bio: "Multi-specialty outpatient clinic in Abu Dhabi. DHA-licensed physicians covering general medicine, dermatology, orthopaedics, and paediatrics. Same-day appointments available.",
    shortDesc: "DHA-licensed multi-specialty clinic in Abu Dhabi.",
    officeAddress: "Villa 7, Al Khalidiyah Street, Abu Dhabi",
    lat: 24.463,
    lng: 54.372,
    categorySlugSuffix: "healthcare-medical",
    verified: true,
    featured: false,
    mapFeatured: true,
    homeFeatured: false,
    foundingExpert: false,
  },

  // ── Saudi Arabia (Riyadh / Jeddah) ─────────────────────────────────────
  {
    country: "sa",
    name: "Saudi Tech Hub",
    businessName: "Saudi Tech Hub Co.",
    email: "contact@sauditecthub.sa",
    phone: "+966512345678",
    whatsapp: "+966512345678",
    isBusiness: true,
    bio: "Leading software house in Riyadh offering mobile app development (iOS & Android), web portals, and Vision 2030-aligned digital transformation consulting. MCIT certified.",
    shortDesc: "MCIT-certified software development — Riyadh.",
    officeAddress: "2nd Floor, Al Akaria Mall, King Fahd Road, Riyadh",
    webAddress: "https://sauditecthub.sa",
    lat: 24.694,
    lng: 46.674,
    categorySlugSuffix: "it-technology",
    verified: true,
    featured: true,
    mapFeatured: true,
    homeFeatured: true,
    foundingExpert: true,
  },
  {
    country: "sa",
    name: "Al Faisal Legal Advisory",
    businessName: "Al Faisal Legal Advisory",
    email: "info@alfaisallegal.sa",
    phone: "+966114567890",
    isBusiness: true,
    bio: "Boutique law firm registered with the Saudi Bar Association. Specialists in commercial law, investment regulations, real estate transactions, and dispute resolution under Saudi law.",
    shortDesc: "Saudi Bar Association — commercial & investment law.",
    officeAddress: "Office 501, Al Faisaliah Tower, King Fahad Road, Riyadh",
    lat: 24.689,
    lng: 46.686,
    categorySlugSuffix: "legal-consulting",
    verified: true,
    featured: true,
    mapFeatured: false,
    homeFeatured: false,
    foundingExpert: true,
  },
  {
    country: "sa",
    name: "Jeddah Beauty & Wellness",
    businessName: "Lumière Beauty Studio",
    email: "lumiere@beautysa.com",
    phone: "+966125678901",
    isBusiness: true,
    bio: "Luxury beauty salon in Jeddah offering hair styling, skincare treatments, bridal packages, and wellness therapies. All services by certified therapists in a private, premium environment.",
    shortDesc: "Premium beauty salon & wellness in Jeddah.",
    officeAddress: "Al Hamra District, King Abdullah Road, Jeddah",
    lat: 21.543,
    lng: 39.173,
    categorySlugSuffix: "beauty-wellness",
    verified: true,
    featured: false,
    mapFeatured: true,
    homeFeatured: false,
    foundingExpert: false,
  },
  {
    country: "sa",
    name: "Riyadh Engineering Group",
    businessName: "REG Consultants",
    email: "info@regconsult.sa",
    phone: "+966115678901",
    isBusiness: true,
    bio: "Civil and structural engineering firm serving residential, commercial, and government projects across the Kingdom. Licensed by the Saudi Council of Engineers.",
    shortDesc: "Saudi Council of Engineers licensed — civil & structural.",
    officeAddress: "Al Olaya District, Prince Muhammad Ibn Abdulaziz Road, Riyadh",
    lat: 24.711,
    lng: 46.682,
    categorySlugSuffix: "engineering",
    verified: true,
    featured: false,
    mapFeatured: true,
    homeFeatured: false,
    foundingExpert: false,
  },

  // ── Singapore ──────────────────────────────────────────────────────────
  {
    country: "sg",
    name: "SingTech Solutions",
    businessName: "SingTech Solutions Pte. Ltd.",
    email: "hello@singtech.sg",
    phone: "+6562345678",
    whatsapp: "+6562345678",
    isBusiness: true,
    bio: "Singapore-based technology consultancy helping SMEs and startups modernise with cloud infrastructure, data analytics, and custom software. AWS Advanced Partner. 50+ clients served.",
    shortDesc: "AWS Advanced Partner — cloud & custom software, Singapore.",
    officeAddress: "10 Anson Road, #20-10 International Plaza, Singapore 079903",
    webAddress: "https://singtech.sg",
    lat: 1.275,
    lng: 103.846,
    categorySlugSuffix: "it-technology",
    verified: true,
    featured: true,
    mapFeatured: true,
    homeFeatured: true,
    foundingExpert: true,
  },
  {
    country: "sg",
    name: "Lion City Education",
    businessName: "Lion City Education Centre",
    email: "enrol@lioncityedu.sg",
    phone: "+6568901234",
    isBusiness: true,
    bio: "MOE-registered enrichment centre offering primary, secondary, and JC tuition in Mathematics, Science, and English. Small class sizes (max 8 students) for personalised attention.",
    shortDesc: "MOE-registered tutoring — primary to JC, Singapore.",
    officeAddress: "Blk 201, Tampines Street 21, #01-855, Singapore 521201",
    lat: 1.354,
    lng: 103.939,
    categorySlugSuffix: "education-tutoring",
    verified: true,
    featured: false,
    mapFeatured: true,
    homeFeatured: false,
    foundingExpert: false,
  },
  {
    country: "sg",
    name: "Singapore Legal Partners",
    businessName: "SLP Law LLC",
    email: "consult@slplaw.sg",
    phone: "+6566789012",
    isBusiness: true,
    bio: "Law Corporation registered with the Law Society of Singapore. Practice areas: commercial contracts, employment law, immigration, conveyancing, and corporate secretarial services.",
    shortDesc: "Law Society registered — commercial & immigration law.",
    officeAddress: "6 Battery Road, #30-00, Singapore 049909",
    lat: 1.282,
    lng: 103.851,
    categorySlugSuffix: "legal-consulting",
    verified: true,
    featured: true,
    mapFeatured: false,
    homeFeatured: false,
    foundingExpert: true,
  },
  {
    country: "sg",
    name: "SG Events & Weddings",
    businessName: "Enchanted Events Pte. Ltd.",
    email: "hello@enchanted.sg",
    phone: "+6591234567",
    whatsapp: "+6591234567",
    isBusiness: true,
    bio: "Full-service event management and wedding planning company. From intimate solemnisations to 500-pax ballroom weddings. Florals, catering coordination, A/V, and décor all handled in-house.",
    shortDesc: "Full-service wedding & events planner — Singapore.",
    officeAddress: "7 Empress Road, #03-08, Singapore 260007",
    lat: 1.316,
    lng: 103.810,
    categorySlugSuffix: "events-weddings",
    verified: true,
    featured: false,
    mapFeatured: true,
    homeFeatured: false,
    foundingExpert: false,
  },
];

// ─── Seed function ────────────────────────────────────────────────────────────

async function main() {
  console.log("─── Pricing plans ───────────────────────────────────────────");
  for (const plan of PLANS) {
    const existing = await prisma.pricing.findFirst({ where: { name: plan.name } });
    if (existing) {
      await prisma.pricing.update({ where: { id: existing.id }, data: plan });
      console.log(`  ↻ Updated: ${plan.name}`);
    } else {
      await prisma.pricing.create({ data: plan });
      console.log(`  + Created: ${plan.name}`);
    }
  }

  console.log("\n─── Experts ─────────────────────────────────────────────────");

  for (const def of EXPERTS) {
    // 1. Category lookup
    const catSlug = `${def.categorySlugSuffix}-${def.country}`;
    const category = await prisma.category.findFirst({ where: { slug: catSlug } });
    if (!category) {
      console.warn(`  ⚠ Category not found: ${catSlug} — skipping ${def.name}`);
      continue;
    }

    let extraCategory = null;
    if (def.extraCategorySlugSuffix) {
      const extraSlug = `${def.extraCategorySlugSuffix}-${def.country}`;
      extraCategory = await prisma.category.findFirst({ where: { slug: extraSlug } });
    }

    // 2. Expert user account
    const userEmail = def.email;
    let user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      const pw = await bcrypt.hash("expert123", 10);
      user = await prisma.user.create({
        data: { email: userEmail, password: pw, name: def.businessName || def.name, role: "EXPERT", verified: true },
      });
    }

    // 3. Expert profile
    const profileLink = slug(def.businessName || def.name);
    let expert = await prisma.expert.findFirst({ where: { email: def.email } });

    const profilePicture = avatar(def.businessName || def.name);

    const expertData = {
      name: def.name,
      email: def.email,
      businessName: def.businessName ?? null,
      isBusiness: def.isBusiness,
      phone: def.phone,
      whatsapp: def.whatsapp ?? null,
      bio: def.bio,
      shortDesc: def.shortDesc,
      officeAddress: def.officeAddress,
      webAddress: def.webAddress ?? null,
      countryCode: def.country,
      profileLink,
      profilePicture,
      latitude: def.lat,
      longitude: def.lng,
      mapLocation: `${def.lat},${def.lng}`,
      verified: def.verified,
      featured: def.featured,
      mapFeatured: def.mapFeatured,
      homeFeatured: def.homeFeatured,
      foundingExpert: def.foundingExpert,
      foundingExpertSince: def.foundingExpert ? new Date("2026-01-15") : null,
    };

    if (expert) {
      expert = await prisma.expert.update({ where: { id: expert.id }, data: expertData });
      console.log(`  ↻ Updated: ${def.businessName || def.name} (${def.country})`);
    } else {
      expert = await prisma.expert.create({ data: expertData });
      console.log(`  + Created: ${def.businessName || def.name} (${def.country})`);
    }

    // 4. Categories
    await prisma.expertCategory.upsert({
      where: { expertId_categoryId: { expertId: expert.id, categoryId: category.id } },
      update: {},
      create: { expertId: expert.id, categoryId: category.id },
    });
    if (extraCategory) {
      await prisma.expertCategory.upsert({
        where: { expertId_categoryId: { expertId: expert.id, categoryId: extraCategory.id } },
        update: {},
        create: { expertId: expert.id, categoryId: extraCategory.id },
      });
    }
  }

  // ─── Summary ─────────────────────────────────────────────────────────────
  const [totalExperts, totalPlans] = await Promise.all([
    prisma.expert.count(),
    prisma.pricing.count(),
  ]);

  console.log("\n─── Done ────────────────────────────────────────────────────");
  console.log(`  Experts : ${totalExperts}`);
  console.log(`  Plans   : ${totalPlans}`);
  console.log("  Expert login: expert123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
