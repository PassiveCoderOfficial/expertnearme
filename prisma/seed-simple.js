const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting database seeding...");

  // Countries
  console.log("📍 Seeding countries...");
  const countries = [
    { code: "bd", name: "Bangladesh", active: true, currency: "BDT", timezone: "Asia/Dhaka", flagEmoji: "🇧🇩" },
    { code: "ae", name: "United Arab Emirates", active: true, currency: "AED", timezone: "Asia/Dubai", flagEmoji: "🇦🇪" },
    { code: "qa", name: "Qatar", active: true, currency: "QAR", timezone: "Asia/Qatar", flagEmoji: "🇶🇦" },
    { code: "my", name: "Malaysia", active: true, currency: "MYR", timezone: "Asia/Kuala_Lumpur", flagEmoji: "🇲🇾" },
    { code: "th", name: "Thailand", active: true, currency: "THB", timezone: "Asia/Bangkok", flagEmoji: "🇹🇭" },
    { code: "iq", name: "Iraq", active: true, currency: "IQD", timezone: "Asia/Baghdad", flagEmoji: "🇮🇶" },
    { code: "sa", name: "Saudi Arabia", active: true, currency: "SAR", timezone: "Asia/Riyadh", flagEmoji: "🇸🇦" },
  ];

  for (const country of countries) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: {},
      create: country,
    });
  }
  console.log(`✅ Created ${countries.length} countries`);

  // Categories
  console.log("📂 Seeding categories...");
  const categories = [
    { name: "Carpentry", slug: "carpentry", countryCode: "ae", showOnHomepage: true, description: "Professional carpentry and woodwork services" },
    { name: "Painting", slug: "painting", countryCode: "ae", showOnHomepage: true, description: "Interior and exterior painting services" },
    { name: "Flooring", slug: "flooring", countryCode: "ae", showOnHomepage: true, description: "All types of flooring installation" },
    { name: "Plumbing", slug: "plumbing", countryCode: "ae", showOnHomepage: true, description: "Professional plumbing services" },
    { name: "Electrical", slug: "electrical", countryCode: "ae", showOnHomepage: true, description: "Electrical installation and repair" },
    { name: "HVAC", slug: "hvac", countryCode: "ae", showOnHomepage: true, description: "Air conditioning and ventilation" },
    { name: "Gardening", slug: "gardening", countryCode: "ae", showOnHomepage: true, description: "Landscaping and garden services" },
    { name: "Metal Works", slug: "metal-works", countryCode: "ae", showOnHomepage: true, description: "Custom metal fabrication and welding" },
    { name: "CNC Machining", slug: "cnc-machining", countryCode: "ae", showOnHomepage: true, description: "Precision CNC machining services" },
    { name: "Steel Fabrication", slug: "steel-fabrication", countryCode: "ae", showOnHomepage: true, description: "Steel structure fabrication" },
    { name: "Aluminum Works", slug: "aluminum-works", countryCode: "ae", showOnHomepage: true, description: "Aluminum doors, windows, and fabrication" },
    { name: "Interior Design", slug: "interior-design", countryCode: "ae", showOnHomepage: true, description: "Professional interior design services" },
    { name: "Curtains & Blinds", slug: "curtains-blinds", countryCode: "ae", showOnHomepage: true, description: "Custom curtains and blinds" },
    { name: "Kitchen Design", slug: "kitchen-design", countryCode: "ae", showOnHomepage: true, description: "Kitchen cabinets and design" },
    { name: "Furniture", slug: "furniture", countryCode: "qa", showOnHomepage: true, description: "Custom furniture making" },
    { name: "Home Decor", slug: "home-decor", countryCode: "qa", showOnHomepage: true, description: "Home decoration and accessories" },
    { name: "Doors", slug: "doors", countryCode: "ae", showOnHomepage: true, description: "All types of doors" },
    { name: "Windows", slug: "windows", countryCode: "ae", showOnHomepage: true, description: "Aluminum and UPVC windows" },
    { name: "Engineering", slug: "engineering", countryCode: "ae", showOnHomepage: true, description: "Engineering solutions" },
    { name: "Carpentry", slug: "carpentry-general", countryCode: "iq", showOnHomepage: true, description: "Carpentry and woodwork" },
    { name: "Restaurants", slug: "restaurants", countryCode: "th", showOnHomepage: true, description: "Restaurant and catering services" },
    { name: "Bengali Food", slug: "bengali-food", countryCode: "th", showOnHomepage: true, description: "Authentic Bengali cuisine" },
    { name: "Arabic Food", slug: "arabic-food", countryCode: "th", showOnHomepage: true, description: "Traditional Arabic food" },
    { name: "Fish Market", slug: "fish-market", countryCode: "bd", showOnHomepage: true, description: "Fresh fish and seafood" },
    { name: "Online Shopping", slug: "online-shopping", countryCode: "bd", showOnHomepage: true, description: "Online retail stores" },
    { name: "Deep Cleaning", slug: "deep-cleaning", countryCode: "ae", showOnHomepage: true, description: "Professional deep cleaning services" },
    { name: "Water Tank Cleaning", slug: "water-tank-cleaning", countryCode: "ae", showOnHomepage: true, description: "Water tank cleaning and maintenance" },
    { name: "Tailoring", slug: "tailoring", countryCode: "bd", showOnHomepage: true, description: "Custom tailoring services" },
    { name: "Embroidery", slug: "embroidery", countryCode: "bd", showOnHomepage: true, description: "Embroidery and custom designs" },
    { name: "Uniform Garments", slug: "uniform-garments", countryCode: "bd", showOnHomepage: true, description: "Professional uniform manufacturing" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ Created ${categories.length} categories`);

  // Experts
  console.log("👨‍💼 Seeding experts...");
  const experts = [
    {
      name: "Exquisite Designs",
      email: "info@arshop.com.my",
      phone: "+60123456789",
      whatsapp: "+60123456789",
      isBusiness: true,
      businessName: "Exquisite Designs",
      officeAddress: "Selangor, Malaysia",
      webAddress: "https://arshop.com.my",
      shortDesc: "Awning gates, kitchen cabinets, and doors",
      bio: "Over 35 years of expertise in crafting elegant awning gates and kitchen cabinets. We specialize in transforming homes with our premium designs.",
      countryCode: "my",
      featured: true,
      verified: true,
    },
    {
      name: "Anamika Global SDN BHD",
      email: "info@anamikaglobal.com",
      phone: "+60312345678",
      whatsapp: "+60312345678",
      isBusiness: true,
      businessName: "Anamika Global SDN BHD",
      officeAddress: "43800 Dengkil, Selangor",
      webAddress: "https://anamikaglobal.com",
      shortDesc: "Comprehensive metal, aluminum, and glass works",
      bio: "With a strong focus on precision and durability, our skilled team brings decades of expertise to every task. Specializing in custom metalwork, intricate glass installations, and large-scale renovations.",
      countryCode: "my",
      featured: true,
      verified: true,
    },
    {
      name: "Al Chishty Engineering Work",
      email: "info@chishtyengineering.com",
      phone: "+97155555555",
      whatsapp: "+97155555555",
      isBusiness: true,
      businessName: "Al Chishty Engineering Work",
      officeAddress: "Ras Al Khaimah, United Arab Emirates",
      webAddress: "https://chishtyengineering.com",
      shortDesc: "CNC Machining, Steel Fabrication, and Engineering Solutions",
      bio: "Over 35 Years of Expertise in CNC Machining, Steel Fabrication, and Engineering Solutions. Our facility features advanced CNC machines, laser and plasma cutting technology, and a metal foundry.",
      countryCode: "ae",
      featured: true,
      verified: true,
    },
    {
      name: "Mohammed Dimon Blacksmith",
      email: "info@dimonblacksmith.com",
      phone: "+97155555556",
      whatsapp: "+97155555556",
      isBusiness: false,
      shortDesc: "Sliding doors, aluminum and UPVC windows, kitchen cupboards",
      bio: "We transform raw materials into strong, stylish, and long-lasting structures. Specializing in sliding doors, aluminum and UPVC windows, kitchen cupboards, and cladding work for over 5 years.",
      countryCode: "ae",
      featured: true,
      verified: false,
    },
    {
      name: "Bagdad Curtains and Decorations",
      email: "info@bagdaddecor.com",
      phone: "+96455555555",
      whatsapp: "+96455555555",
      isBusiness: true,
      businessName: "Bagdad Curtains and Decorations",
      officeAddress: "Baghdad, Iraq",
      webAddress: "https://bagdaddecor.com",
      shortDesc: "Bespoke curtains, blinds, sofas, and flooring",
      bio: "Crafting exquisite custom furnishings, bespoke curtains, blinds, sofas, wallpaper, flooring, and decor to elevate your interiors. We offer 7-Day Customer Support and 12-Month Warranty.",
      countryCode: "iq",
      featured: true,
      verified: true,
    },
    {
      name: "Vestore Venture",
      email: "info@vestoreventure.com",
      phone: "+97150555555",
      whatsapp: "+97150555555",
      isBusiness: true,
      businessName: "Vestore Venture",
      officeAddress: "Industrial Area 2, Al Dhaid, UAE",
      webAddress: "https://vestoreventure.com",
      shortDesc: "Quality Furniture & Home Décor",
      bio: "Your destination for quality furniture and home décor located in Vestore venture factory. We offer a wide range of beds, sofas, chairs, dining tables, and office furniture.",
      countryCode: "ae",
      featured: false,
      verified: false,
    },
    {
      name: "Qatar Furniture Market",
      email: "info@qatarfurnituremarket.com",
      phone: "+97444444444",
      whatsapp: "+97444444444",
      isBusiness: true,
      businessName: "Qatar Furniture Market",
      officeAddress: "Qatar",
      webAddress: "https://qatarfurnituremarket.com",
      shortDesc: "Custom furniture making in Qatar",
      bio: "As one of the top furniture shops in Qatar, we offer a wide range of custom furniture including Arabic sofas, Arabic majlis, curtains, carpets, and wall panels.",
      countryCode: "qa",
      featured: true,
      verified: true,
    },
    {
      name: "Fish Mart",
      email: "info@fishmart.com.bd",
      phone: "+8801234567890",
      whatsapp: "+8801234567890",
      isBusiness: true,
      businessName: "Fish Mart",
      officeAddress: "Dhaka, Bangladesh",
      webAddress: "https://fishmart.com.bd",
      shortDesc: "Bangladesh First Premium Online Fish Shop",
      bio: "Your trusted online fish shop in Bangladesh offering fresh seafood products with fast delivery.",
      countryCode: "bd",
      featured: true,
      verified: true,
    },
    {
      name: "Panshi Restaurant KSA",
      email: "info@panshiksa.fullready.site",
      phone: "+96655555555",
      whatsapp: "+96655555555",
      isBusiness: true,
      businessName: "Panshi Restaurant KSA",
      officeAddress: "Saudi Arabia",
      webAddress: "https://panshiksa.fullready.site",
      shortDesc: "Best Bangladeshi Restaurant in Saudi Arabia",
      bio: "Experience the essence of Bengali cuisine at Panshi Restaurant. Authentic Bengali food in Saudi Arabia with breakfast, lunch, and dinner. Pure desi taste!",
      countryCode: "sa",
      featured: true,
      verified: true,
    },
    {
      name: "Palace Restaurant",
      email: "info@palacerestaurantthailand.com",
      phone: "+66812345678",
      whatsapp: "+66812345678",
      isBusiness: true,
      businessName: "Palace Restaurant",
      officeAddress: "218 Beach Road, Pattaya City, Chon Buri, Thailand",
      webAddress: "https://palacerestaurantthailand.com",
      shortDesc: "Best Lebanese & Indian Cuisine in Thailand",
      bio: "Best Lebanese & Indian halal cuisine in Pattaya since 2009. Immerse in rich heritage of Lebanese and Indian halal cuisine—crafted authentically, visually stunning, and perfect for cultural explorers.",
      countryCode: "th",
      featured: true,
      verified: true,
    },
  ];

  for (const expert of experts) {
    const createdExpert = await prisma.expert.upsert({
      where: { email: expert.email },
      update: {},
      create: {
        ...expert,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Link expert to categories
    const categorySlugs = getExpertCategories(expert);
    for (const categorySlug of categorySlugs) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });

      if (category && createdExpert) {
        try {
          await prisma.expertCategory.create({
            data: {
              expertId: createdExpert.id,
              categoryId: category.id,
            },
          });
        } catch (e) {
          if (e.code !== 'P2002') { // Ignore duplicate error
            console.log(`⚠️  Duplicate expert-category link for ${expert.email}`);
          }
        }
      }
    }
  }

  console.log(`✅ Created ${experts.length} experts`);

  // Services for engineering expert
  console.log("🛠️  Seeding services and portfolios...");
  const engineeringExpert = await prisma.expert.findUnique({
    where: { email: "info@chishtyengineering.com" },
  });

  if (engineeringExpert) {
    // Services
    const services = [
      { name: "CNC Machining", description: "Precision computer-controlled machining for intricate and high-volume parts" },
      { name: "Laser Cutting", description: "Accurate cutting services for metals and other materials" },
      { name: "Plasma Cutting", description: "High-precision plasma cutting for various materials" },
      { name: "Expert Machining", description: "Expert machining services with traditional tools" },
      { name: "Auto Components", description: "Specialized auto component manufacturing and repair services" },
      { name: "Metal Casting", description: "High-quality metal casting solutions for various industries" },
      { name: "Steel Fabrication", description: "Complete fabrication services from cutting to assembly" },
      { name: "Custom Projects", description: "Complex custom engineering projects" },
    ];

    for (const service of services) {
      try {
        await prisma.service.create({
          data: {
            expertId: engineeringExpert.id,
            name: service.name,
            description: service.description,
          },
        });
      } catch (e) {
        if (e.code !== 'P2002') {
          console.log(`⚠️  Duplicate service: ${service.name}`);
        }
      }
    }

    // Portfolio items
    const portfolioItems = [
      { imageUrl: "https://via.placeholder.com/800x600?text=CNC+Machine", videoUrl: null, socialUrl: "https://chishtyengineering.com/portfolio" },
      { imageUrl: "https://via.placeholder.com/800x600?text=Steel+Fabrication", videoUrl: null, socialUrl: "https://chishtyengineering.com/portfolio" },
      { imageUrl: "https://via.placeholder.com/800x600?text=Custom+Project", videoUrl: null, socialUrl: "https://chishtyengineering.com/portfolio" },
    ];

    for (const item of portfolioItems) {
      try {
        await prisma.portfolio.create({
          data: {
            expertId: engineeringExpert.id,
            imageUrl: item.imageUrl,
            videoUrl: item.videoUrl,
            socialUrl: item.socialUrl,
          },
        });
      } catch (e) {
        if (e.code !== 'P2002') {
          console.log(`⚠️  Duplicate portfolio item`);
        }
      }
    }
  }

  console.log("✅ Database seeding completed successfully!");
}

function getExpertCategories(expert) {
  const keywords = expert.shortDesc.toLowerCase() + " " + expert.bio.toLowerCase();
  const categories = [];

  if (keywords.includes("carpent") || keywords.includes("kitchen") || keywords.includes("cabinet") || keywords.includes("door")) {
    categories.push("carpentry");
    categories.push("kitchen-design");
  }
  if (keywords.includes("metal") || keywords.includes("aluminum") || keywords.includes("fabric") || keywords.includes("weld") || keywords.includes("cnc") || keywords.includes("machin")) {
    categories.push("metal-works");
    categories.push("cnc-machining");
    categories.push("steel-fabrication");
    categories.push("aluminum-works");
    categories.push("engineering");
  }
  if (keywords.includes("curtain") || keywords.includes("blind") || keywords.includes("decor") || keywords.includes("furnitur") || keywords.includes("sofa") || keywords.includes("bed")) {
    categories.push("curtains-blinds");
    categories.push("home-decor");
    categories.push("furniture");
    categories.push("interior-design");
  }
  if (keywords.includes("food") || keywords.includes("restaur") || keywords.includes("bengali") || keywords.includes("arabic")) {
    categories.push("restaurants");
  }
  if (keywords.includes("bengali") && keywords.includes("food")) {
    categories.push("bengali-food");
  }
  if (keywords.includes("arabic") && keywords.includes("food")) {
    categories.push("arabic-food");
  }
  if (keywords.includes("fish") || keywords.includes("seafood")) {
    categories.push("fish-market");
  }

  return [...new Set(categories)];
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
