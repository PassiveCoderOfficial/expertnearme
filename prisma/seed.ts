import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const COUNTRIES = [
  {
    code: 'sg', name: 'Singapore', currency: 'SGD', timezone: 'Asia/Singapore',
    phoneCode: '+65', flagEmoji: '🇸🇬',
    metaTitle: 'Find Experts in Singapore | ExpertNear.Me',
    metaDesc: 'Discover trusted local experts, businesses and service providers in Singapore.',
  },
  {
    code: 'ae', name: 'United Arab Emirates', currency: 'AED', timezone: 'Asia/Dubai',
    phoneCode: '+971', flagEmoji: '🇦🇪',
    metaTitle: 'Find Experts in UAE | ExpertNear.Me',
    metaDesc: 'Discover trusted local experts, businesses and service providers in the UAE.',
  },
  {
    code: 'sa', name: 'Saudi Arabia', currency: 'SAR', timezone: 'Asia/Riyadh',
    phoneCode: '+966', flagEmoji: '🇸🇦',
    metaTitle: 'Find Experts in Saudi Arabia | ExpertNear.Me',
    metaDesc: 'Discover trusted local experts, businesses and service providers in Saudi Arabia.',
  },
  {
    code: 'bd', name: 'Bangladesh', currency: 'BDT', timezone: 'Asia/Dhaka',
    phoneCode: '+880', flagEmoji: '🇧🇩',
    metaTitle: 'Find Experts in Bangladesh | ExpertNear.Me',
    metaDesc: 'Discover trusted local experts, businesses and service providers in Bangladesh.',
  },
];

const CATEGORY_DEFS = [
  { name: 'Furniture & Home Decor',    icon: '🪑', color: '#8B4513', show: true  },
  { name: 'Renovation & Construction', icon: '🔨', color: '#6B7280', show: true  },
  { name: 'Interior Design',           icon: '🏠', color: '#7C3AED', show: true  },
  { name: 'Fashion & Clothing',        icon: '👗', color: '#EC4899', show: true  },
  { name: 'Food & Catering',           icon: '🍽️', color: '#F59E0B', show: true  },
  { name: 'Cleaning Services',         icon: '🧹', color: '#10B981', show: true  },
  { name: 'Engineering',               icon: '⚙️', color: '#3B82F6', show: true  },
  { name: 'IT & Technology',           icon: '💻', color: '#6366F1', show: true  },
  { name: 'Healthcare & Medical',      icon: '❤️', color: '#EF4444', show: true  },
  { name: 'Education & Tutoring',      icon: '📚', color: '#F97316', show: true  },
  { name: 'Photography & Media',       icon: '📸', color: '#8B5CF6', show: false },
  { name: 'Events & Weddings',         icon: '💍', color: '#F43F5E', show: false },
  { name: 'Beauty & Wellness',         icon: '💆', color: '#D946EF', show: false },
  { name: 'Legal & Consulting',        icon: '⚖️', color: '#0EA5E9', show: false },
  { name: 'Automotive',               icon: '🚗', color: '#78716C', show: false },
];

// Expert seed definitions
const EXPERT_DEFS = [
  // Singapore experts
  {
    countryCode: 'sg',
    name: 'Ahmad Razali',
    email: 'ahmad.razali@example.sg',
    phone: '+6591234567',
    whatsapp: '+6591234567',
    isBusiness: false,
    bio: 'Certified interior designer with 12 years experience transforming homes and offices across Singapore. Specialising in modern Japandi and minimalist aesthetics.',
    shortDesc: 'Award-winning interior designer in Singapore',
    profileLink: 'ahmad-razali',
    officeAddress: '88 Orchard Road, Singapore 238839',
    mapLocation: 'Orchard, Singapore',
    latitude: 1.3048,
    longitude: 103.8318,
    webAddress: 'https://ahmaddesigns.sg',
    linkedinUrl: 'https://linkedin.com/in/ahmadrazali',
    verified: true,
    featured: true,
    homeFeatured: true,
    foundingExpert: true,
    allowBooking: true,
    categoryNames: ['Interior Design'],
    services: [
      { name: 'Residential Design Consultation', price: 150, duration: 60, description: 'Full home design assessment and concept presentation.', rateType: 'fixed', availableForBooking: true },
      { name: 'Commercial Space Planning', price: 300, duration: 120, description: 'Office and retail space layout optimisation.', rateType: 'fixed', availableForBooking: true },
      { name: '3D Rendering Package', price: 500, duration: 180, description: 'Photo-realistic 3D renders of your space before renovation.', rateType: 'fixed', availableForBooking: false },
    ],
    availability: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' },
    ],
  },
  {
    countryCode: 'sg',
    name: 'TechFix Solutions',
    email: 'hello@techfix.sg',
    phone: '+6598765432',
    whatsapp: '+6598765432',
    isBusiness: true,
    businessName: 'TechFix Solutions Pte Ltd',
    contactPerson: 'Kevin Lim',
    bio: 'Singapore\'s fastest IT support and cybersecurity firm. We fix laptops, servers, networks, and protect your business from cyber threats. Same-day service available.',
    shortDesc: 'Fast IT support & cybersecurity, Singapore',
    profileLink: 'techfix-solutions',
    officeAddress: '71 Ayer Rajah Crescent, Singapore 139951',
    mapLocation: 'one-north, Singapore',
    latitude: 1.2995,
    longitude: 103.7872,
    verified: true,
    featured: true,
    mapFeatured: true,
    foundingExpert: true,
    allowBooking: true,
    categoryNames: ['IT & Technology'],
    services: [
      { name: 'Laptop Repair', price: 80, duration: 90, description: 'Hardware and software repairs for all brands.', rateType: 'fixed', availableForBooking: true },
      { name: 'Network Setup', price: 200, duration: 120, description: 'Home and office network installation and configuration.', rateType: 'fixed', availableForBooking: true },
      { name: 'Cybersecurity Audit', price: 500, duration: 240, description: 'Comprehensive security assessment for SMEs.', rateType: 'fixed', availableForBooking: true },
    ],
    availability: [
      { dayOfWeek: 1, startTime: '08:00', endTime: '20:00' },
      { dayOfWeek: 2, startTime: '08:00', endTime: '20:00' },
      { dayOfWeek: 3, startTime: '08:00', endTime: '20:00' },
      { dayOfWeek: 4, startTime: '08:00', endTime: '20:00' },
      { dayOfWeek: 5, startTime: '08:00', endTime: '20:00' },
      { dayOfWeek: 6, startTime: '10:00', endTime: '16:00' },
    ],
  },
  {
    countryCode: 'sg',
    name: 'Dr. Priya Nair',
    email: 'dr.priya@wellnesshub.sg',
    phone: '+6592345678',
    isBusiness: false,
    bio: 'MBBS, MRCP (UK). General practitioner with 15 years clinical experience. Offering teleconsultation and home visits across Singapore. Fluent in English, Tamil, and Hindi.',
    shortDesc: 'GP with home visit & teleconsult, Singapore',
    profileLink: 'dr-priya-nair',
    officeAddress: '1 Raffles Place, Singapore 048616',
    mapLocation: 'CBD, Singapore',
    latitude: 1.2844,
    longitude: 103.8511,
    verified: true,
    featured: false,
    foundingExpert: true,
    allowBooking: true,
    categoryNames: ['Healthcare & Medical'],
    services: [
      { name: 'Teleconsultation', price: 40, duration: 20, description: 'Video call consultation, MC and prescriptions included.', rateType: 'fixed', availableForBooking: true },
      { name: 'Home Visit', price: 150, duration: 45, description: 'Doctor visit to your home in Singapore.', rateType: 'fixed', availableForBooking: true },
    ],
    availability: [
      { dayOfWeek: 1, startTime: '08:00', endTime: '13:00' },
      { dayOfWeek: 2, startTime: '08:00', endTime: '13:00' },
      { dayOfWeek: 3, startTime: '14:00', endTime: '20:00' },
      { dayOfWeek: 4, startTime: '14:00', endTime: '20:00' },
      { dayOfWeek: 6, startTime: '09:00', endTime: '13:00' },
    ],
  },
  // UAE experts
  {
    countryCode: 'ae',
    name: 'BuildRight Contracting',
    email: 'info@buildright.ae',
    phone: '+971501234567',
    whatsapp: '+971501234567',
    isBusiness: true,
    businessName: 'BuildRight Contracting LLC',
    contactPerson: 'Mohammed Al Rashid',
    bio: 'Dubai\'s trusted renovation and construction partner since 2008. From villa renovations to commercial fit-outs. Licensed by Dubai Municipality. Over 500 completed projects.',
    shortDesc: 'Licensed renovation & construction, Dubai',
    profileLink: 'buildright-contracting',
    officeAddress: 'Al Quoz Industrial Area 3, Dubai, UAE',
    mapLocation: 'Al Quoz, Dubai',
    latitude: 25.1548,
    longitude: 55.2248,
    webAddress: 'https://buildright.ae',
    verified: true,
    featured: true,
    homeFeatured: true,
    mapFeatured: true,
    foundingExpert: true,
    allowBooking: true,
    categoryNames: ['Renovation & Construction'],
    services: [
      { name: 'Free Site Inspection', price: 0, duration: 60, description: 'Free visit to assess your renovation or construction needs.', rateType: 'fixed', availableForBooking: true },
      { name: 'Bathroom Renovation', price: 8000, duration: 480, description: 'Complete bathroom remodelling. Price varies by scope.', rateType: 'fixed', availableForBooking: false },
      { name: 'Villa Renovation Consultation', price: 500, duration: 120, description: 'Detailed scope and quotation for full villa renovation.', rateType: 'fixed', availableForBooking: true },
    ],
    availability: [
      { dayOfWeek: 0, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 1, startTime: '08:00', endTime: '18:00' },
      { dayOfWeek: 2, startTime: '08:00', endTime: '18:00' },
      { dayOfWeek: 3, startTime: '08:00', endTime: '18:00' },
      { dayOfWeek: 4, startTime: '08:00', endTime: '18:00' },
    ],
  },
  {
    countryCode: 'ae',
    name: 'Fatima Al Zahra',
    email: 'fatima@elegantevents.ae',
    phone: '+971521234567',
    whatsapp: '+971521234567',
    isBusiness: false,
    bio: 'Luxury wedding and events planner based in Dubai. Specialised in Arabic, South Asian, and Western weddings. Managed 200+ events across UAE. Featured in Vogue Arabia.',
    shortDesc: 'Luxury wedding planner, Dubai',
    profileLink: 'fatima-al-zahra',
    officeAddress: 'Business Bay, Dubai, UAE',
    mapLocation: 'Business Bay, Dubai',
    latitude: 25.1868,
    longitude: 55.2603,
    instagramUrl: 'https://instagram.com/fatimaevents',
    verified: true,
    featured: true,
    foundingExpert: true,
    allowBooking: true,
    categoryNames: ['Events & Weddings'],
    services: [
      { name: 'Wedding Planning Consultation', price: 200, duration: 90, description: 'Initial planning meeting, vision board and budget outline.', rateType: 'fixed', availableForBooking: true },
      { name: 'Full Wedding Package', price: 15000, duration: 480, description: 'End-to-end wedding coordination and management.', rateType: 'fixed', availableForBooking: false },
    ],
    availability: [
      { dayOfWeek: 0, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 1, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 2, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 3, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 4, startTime: '10:00', endTime: '18:00' },
    ],
  },
  {
    countryCode: 'ae',
    name: 'SparkClean Services',
    email: 'bookings@sparkclean.ae',
    phone: '+971555678901',
    whatsapp: '+971555678901',
    isBusiness: true,
    businessName: 'SparkClean Services LLC',
    contactPerson: 'Raj Kumar',
    bio: 'Professional deep cleaning, move-in/out cleaning, and office cleaning across Dubai and Abu Dhabi. Eco-friendly products. Insured and police-checked staff.',
    shortDesc: 'Deep cleaning services across UAE',
    profileLink: 'sparkclean-services',
    officeAddress: 'Deira, Dubai, UAE',
    mapLocation: 'Deira, Dubai',
    latitude: 25.2716,
    longitude: 55.3252,
    verified: true,
    featured: false,
    mapFeatured: true,
    foundingExpert: false,
    allowBooking: true,
    categoryNames: ['Cleaning Services'],
    services: [
      { name: 'Standard Home Cleaning (3BR)', price: 250, duration: 240, description: '3-bedroom apartment deep clean. Includes all rooms, kitchen, bathrooms.', rateType: 'fixed', availableForBooking: true },
      { name: 'Move-In/Out Cleaning', price: 400, duration: 360, description: 'Thorough end-of-tenancy or move-in cleaning.', rateType: 'fixed', availableForBooking: true },
      { name: 'Office Cleaning (monthly)', price: 800, duration: 120, description: 'Regular office cleaning contract, priced per month.', rateType: 'fixed', availableForBooking: false },
    ],
    availability: [
      { dayOfWeek: 0, startTime: '08:00', endTime: '20:00' },
      { dayOfWeek: 1, startTime: '08:00', endTime: '20:00' },
      { dayOfWeek: 2, startTime: '08:00', endTime: '20:00' },
      { dayOfWeek: 3, startTime: '08:00', endTime: '20:00' },
      { dayOfWeek: 4, startTime: '08:00', endTime: '20:00' },
      { dayOfWeek: 6, startTime: '09:00', endTime: '18:00' },
    ],
  },
  // Saudi Arabia experts
  {
    countryCode: 'sa',
    name: 'Al-Noor Furniture Workshop',
    email: 'sales@alnoor-furniture.sa',
    phone: '+966501234567',
    whatsapp: '+966501234567',
    isBusiness: true,
    businessName: 'Al-Noor Furniture Workshop',
    contactPerson: 'Abdullah Al-Ghamdi',
    bio: 'Custom Arabic and modern furniture maker in Riyadh. Majlis sets, bedroom furniture, office desks. 20 years of craftsmanship. Delivery and installation included.',
    shortDesc: 'Custom furniture maker, Riyadh',
    profileLink: 'al-noor-furniture',
    officeAddress: 'Industrial Area, Riyadh 12342, Saudi Arabia',
    mapLocation: 'Industrial Area, Riyadh',
    latitude: 24.6749,
    longitude: 46.7077,
    verified: true,
    featured: true,
    foundingExpert: true,
    allowBooking: true,
    categoryNames: ['Furniture & Home Decor'],
    services: [
      { name: 'In-Home Consultation', price: 0, duration: 60, description: 'Free home visit to measure and discuss your furniture needs.', rateType: 'fixed', availableForBooking: true },
      { name: 'Custom Majlis Set', price: 3500, duration: 720, description: 'Bespoke Arabic sitting room set, fabric of choice.', rateType: 'fixed', availableForBooking: false },
    ],
    availability: [
      { dayOfWeek: 0, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '15:00' },
    ],
  },
  {
    countryCode: 'sa',
    name: 'Sarah Ahmed',
    email: 'sarah.ahmed.tutor@gmail.com',
    phone: '+966551234567',
    isBusiness: false,
    bio: 'Experienced teacher with a Master\'s degree in Education. Offering private tutoring in Math, Physics, and Chemistry for grades 7-12. Serving Jeddah and online.',
    shortDesc: 'STEM tutor grades 7-12, Jeddah',
    profileLink: 'sarah-ahmed-tutor',
    officeAddress: 'Al Zahra District, Jeddah 23624, Saudi Arabia',
    mapLocation: 'Al Zahra, Jeddah',
    latitude: 21.5769,
    longitude: 39.1728,
    verified: true,
    featured: false,
    foundingExpert: true,
    allowBooking: true,
    categoryNames: ['Education & Tutoring'],
    services: [
      { name: 'Math Tutoring Session', price: 80, duration: 60, description: 'One-on-one tutoring session for grades 7-12.', rateType: 'fixed', availableForBooking: true },
      { name: 'Exam Prep Package (5 sessions)', price: 350, duration: 60, description: 'Focused exam preparation, 5 sessions.', rateType: 'fixed', availableForBooking: true },
    ],
    availability: [
      { dayOfWeek: 0, startTime: '16:00', endTime: '21:00' },
      { dayOfWeek: 1, startTime: '16:00', endTime: '21:00' },
      { dayOfWeek: 2, startTime: '16:00', endTime: '21:00' },
      { dayOfWeek: 3, startTime: '16:00', endTime: '21:00' },
      { dayOfWeek: 4, startTime: '16:00', endTime: '21:00' },
      { dayOfWeek: 6, startTime: '10:00', endTime: '14:00' },
    ],
  },
  // Bangladesh experts
  {
    countryCode: 'bd',
    name: 'Rahim Uddin',
    email: 'rahim.photo@gmail.com',
    phone: '+8801712345678',
    whatsapp: '+8801712345678',
    isBusiness: false,
    bio: 'Professional photographer based in Dhaka. Wedding, corporate, and product photography. 8 years experience. Over 300 weddings covered across Bangladesh.',
    shortDesc: 'Wedding & corporate photographer, Dhaka',
    profileLink: 'rahim-uddin-photography',
    officeAddress: 'Gulshan 2, Dhaka 1212, Bangladesh',
    mapLocation: 'Gulshan, Dhaka',
    latitude: 23.7937,
    longitude: 90.4065,
    instagramUrl: 'https://instagram.com/rahimphoto',
    verified: true,
    featured: true,
    homeFeatured: true,
    foundingExpert: true,
    allowBooking: true,
    categoryNames: ['Photography & Media'],
    services: [
      { name: 'Wedding Photography (full day)', price: 25000, duration: 480, description: 'Complete wedding day coverage, 500+ edited photos.', rateType: 'fixed', availableForBooking: true },
      { name: 'Corporate Headshots', price: 3000, duration: 60, description: 'Professional headshots for executives and teams.', rateType: 'fixed', availableForBooking: true },
      { name: 'Product Photography (10 items)', price: 5000, duration: 120, description: 'E-commerce and catalogue photography.', rateType: 'fixed', availableForBooking: true },
    ],
    availability: [
      { dayOfWeek: 0, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 1, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 2, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 3, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 4, startTime: '10:00', endTime: '18:00' },
    ],
  },
  {
    countryCode: 'bd',
    name: 'Tasty Bites Catering',
    email: 'orders@tastybites.com.bd',
    phone: '+8801812345678',
    whatsapp: '+8801812345678',
    isBusiness: true,
    businessName: 'Tasty Bites Catering Ltd',
    contactPerson: 'Nasrin Begum',
    bio: 'Premium catering for weddings, corporate events, and private parties in Dhaka. Bengali, Chinese, and Continental menus. Minimum 50 guests. Delivery and setup included.',
    shortDesc: 'Premium catering for events, Dhaka',
    profileLink: 'tasty-bites-catering',
    officeAddress: 'Mirpur DOHS, Dhaka 1216, Bangladesh',
    mapLocation: 'Mirpur, Dhaka',
    latitude: 23.8103,
    longitude: 90.3634,
    verified: true,
    featured: true,
    mapFeatured: true,
    foundingExpert: false,
    allowBooking: true,
    categoryNames: ['Food & Catering'],
    services: [
      { name: 'Catering Consultation', price: 0, duration: 45, description: 'Free menu tasting and event planning discussion.', rateType: 'fixed', availableForBooking: true },
      { name: 'Wedding Buffet (per head)', price: 800, duration: 480, description: 'Full wedding buffet setup, service and cleanup.', rateType: 'fixed', availableForBooking: false },
    ],
    availability: [
      { dayOfWeek: 0, startTime: '10:00', endTime: '19:00' },
      { dayOfWeek: 1, startTime: '10:00', endTime: '19:00' },
      { dayOfWeek: 2, startTime: '10:00', endTime: '19:00' },
      { dayOfWeek: 3, startTime: '10:00', endTime: '19:00' },
      { dayOfWeek: 4, startTime: '10:00', endTime: '19:00' },
      { dayOfWeek: 6, startTime: '11:00', endTime: '17:00' },
    ],
  },
  {
    countryCode: 'bd',
    name: 'Mohammad Karim',
    email: 'karim.electrician@gmail.com',
    phone: '+8801612345678',
    whatsapp: '+8801612345678',
    isBusiness: false,
    bio: 'Licensed electrical engineer with 10 years of hands-on experience. Residential and commercial wiring, solar panel installation, generator maintenance. Serving all of Dhaka.',
    shortDesc: 'Licensed electrician & solar installer, Dhaka',
    profileLink: 'mohammad-karim-electrician',
    officeAddress: 'Dhanmondi, Dhaka 1209, Bangladesh',
    mapLocation: 'Dhanmondi, Dhaka',
    latitude: 23.7461,
    longitude: 90.3742,
    verified: true,
    featured: false,
    foundingExpert: true,
    allowBooking: true,
    categoryNames: ['Engineering'],
    services: [
      { name: 'Electrical Inspection', price: 500, duration: 60, description: 'Full home electrical safety inspection and report.', rateType: 'fixed', availableForBooking: true },
      { name: 'Solar Panel Installation', price: 50000, duration: 480, description: '3kW rooftop solar system, includes all equipment.', rateType: 'fixed', availableForBooking: false },
      { name: 'Wiring Repair', price: 300, duration: 60, description: 'Fault finding and repair of electrical wiring issues.', rateType: 'fixed', availableForBooking: true },
    ],
    availability: [
      { dayOfWeek: 0, startTime: '08:00', endTime: '17:00' },
      { dayOfWeek: 1, startTime: '08:00', endTime: '17:00' },
      { dayOfWeek: 2, startTime: '08:00', endTime: '17:00' },
      { dayOfWeek: 3, startTime: '08:00', endTime: '17:00' },
      { dayOfWeek: 4, startTime: '08:00', endTime: '17:00' },
      { dayOfWeek: 6, startTime: '09:00', endTime: '14:00' },
    ],
  },
  {
    countryCode: 'bd',
    name: 'Shaira Beauty Lounge',
    email: 'shaira@beautylounge.com.bd',
    phone: '+8801912345678',
    whatsapp: '+8801912345678',
    isBusiness: true,
    businessName: 'Shaira Beauty Lounge',
    contactPerson: 'Shaira Akter',
    bio: 'Premium beauty salon in Uttara, Dhaka. Hair, skin, bridal makeup, nail art. Walk-in and appointment. Trained by CIDESCO-certified beauticians. Ladies only.',
    shortDesc: 'Premium beauty salon, Uttara Dhaka',
    profileLink: 'shaira-beauty-lounge',
    officeAddress: 'House 12, Sector 7, Uttara, Dhaka 1230, Bangladesh',
    mapLocation: 'Uttara, Dhaka',
    latitude: 23.8765,
    longitude: 90.3982,
    instagramUrl: 'https://instagram.com/shairabeauty',
    verified: true,
    featured: true,
    foundingExpert: false,
    allowBooking: true,
    categoryNames: ['Beauty & Wellness'],
    services: [
      { name: 'Bridal Makeup (full)', price: 8000, duration: 180, description: 'Complete bridal look including hair and saree draping.', rateType: 'fixed', availableForBooking: true },
      { name: 'Hair Treatment', price: 1500, duration: 90, description: 'Deep conditioning, keratin or protein treatment.', rateType: 'fixed', availableForBooking: true },
      { name: 'Party Makeup', price: 2500, duration: 60, description: 'Party or engagement makeup with false lashes.', rateType: 'fixed', availableForBooking: true },
    ],
    availability: [
      { dayOfWeek: 0, startTime: '10:00', endTime: '20:00' },
      { dayOfWeek: 1, startTime: '10:00', endTime: '20:00' },
      { dayOfWeek: 2, startTime: '10:00', endTime: '20:00' },
      { dayOfWeek: 3, startTime: '10:00', endTime: '20:00' },
      { dayOfWeek: 4, startTime: '10:00', endTime: '20:00' },
      { dayOfWeek: 6, startTime: '11:00', endTime: '20:00' },
    ],
  },
  {
    countryCode: 'sg',
    name: 'Felix Tan Legal',
    email: 'felix@felixtan.law.sg',
    phone: '+6594321098',
    isBusiness: false,
    bio: 'Singapore-qualified lawyer. Specialising in employment law, company incorporation, and commercial contracts. Transparent fixed fees. Over 400 clients served.',
    shortDesc: 'Employment & commercial lawyer, Singapore',
    profileLink: 'felix-tan-legal',
    officeAddress: 'Marina Bay Financial Centre, Singapore 018982',
    mapLocation: 'Marina Bay, Singapore',
    latitude: 1.2796,
    longitude: 103.8522,
    linkedinUrl: 'https://linkedin.com/in/felixtan',
    webAddress: 'https://felixtan.law.sg',
    verified: true,
    featured: false,
    foundingExpert: true,
    allowBooking: true,
    categoryNames: ['Legal & Consulting'],
    services: [
      { name: 'Legal Consultation (1hr)', price: 300, duration: 60, description: 'Initial consultation on employment or commercial legal matters.', rateType: 'fixed', availableForBooking: true },
      { name: 'Contract Review', price: 500, duration: 120, description: 'Review and advice on commercial contracts up to 20 pages.', rateType: 'fixed', availableForBooking: true },
    ],
    availability: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '13:00' },
    ],
  },
  {
    countryCode: 'ae',
    name: 'Drive Pro Auto',
    email: 'service@driveproauto.ae',
    phone: '+971551234567',
    whatsapp: '+971551234567',
    isBusiness: true,
    businessName: 'Drive Pro Auto Service Centre',
    contactPerson: 'George Mathew',
    bio: 'Authorised multi-brand auto service centre in Dubai. Expert technicians for BMW, Mercedes, Audi, Toyota, and all brands. Car pickup and drop-off available.',
    shortDesc: 'Multi-brand auto service centre, Dubai',
    profileLink: 'drive-pro-auto',
    officeAddress: 'Al Quoz 3, Sheikh Zayed Road, Dubai, UAE',
    mapLocation: 'Al Quoz, Dubai',
    latitude: 25.1462,
    longitude: 55.2195,
    webAddress: 'https://driveproauto.ae',
    verified: true,
    featured: false,
    mapFeatured: true,
    foundingExpert: false,
    allowBooking: true,
    categoryNames: ['Automotive'],
    services: [
      { name: 'Full Service & Oil Change', price: 350, duration: 120, description: 'Complete vehicle service with synthetic oil change.', rateType: 'fixed', availableForBooking: true },
      { name: 'Car Diagnostics', price: 150, duration: 60, description: 'Computer diagnostics and fault code reading.', rateType: 'fixed', availableForBooking: true },
      { name: 'AC Service', price: 200, duration: 90, description: 'Air conditioning gas recharge and system check.', rateType: 'fixed', availableForBooking: true },
    ],
    availability: [
      { dayOfWeek: 0, startTime: '08:00', endTime: '18:00' },
      { dayOfWeek: 1, startTime: '08:00', endTime: '18:00' },
      { dayOfWeek: 2, startTime: '08:00', endTime: '18:00' },
      { dayOfWeek: 3, startTime: '08:00', endTime: '18:00' },
      { dayOfWeek: 4, startTime: '08:00', endTime: '18:00' },
      { dayOfWeek: 6, startTime: '09:00', endTime: '15:00' },
    ],
  },
];

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function main() {
  // Default categories
  const categories = [
    { name: "Legal", slug: "legal" },
    { name: "Finance", slug: "finance" },
    { name: "Health", slug: "health" },
    { name: "Education", slug: "education" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        showOnHomepage: true,
        countryCode: "us",
      },
    });
  }

  console.log('\n📂 Seeding categories...');
  for (const country of COUNTRIES) {
    for (const cat of CATEGORY_DEFS) {
      const slug = slugify(cat.name);
      await prisma.category.upsert({
        where: { countryCode_slug: { countryCode: country.code, slug } },
        update: { name: cat.name, icon: cat.icon, color: cat.color, active: true, showOnHomepage: cat.show },
        create: { name: cat.name, slug, countryCode: country.code, active: true, showOnHomepage: cat.show, icon: cat.icon, color: cat.color },
      });
    }
    console.log(`  ✓ ${country.flagEmoji} ${CATEGORY_DEFS.length} categories for ${country.name}`);
  }

  console.log('\n🧑‍💼 Seeding experts...');
  for (const def of EXPERT_DEFS) {
    // Upsert expert
    const expert = await prisma.expert.upsert({
      where: { email: def.email },
      update: {
        name: def.name,
        phone: def.phone,
        whatsapp: def.whatsapp,
        isBusiness: def.isBusiness,
        businessName: (def as any).businessName,
        contactPerson: (def as any).contactPerson,
        bio: def.bio,
        shortDesc: def.shortDesc,
        profileLink: def.profileLink,
        officeAddress: def.officeAddress,
        mapLocation: def.mapLocation,
        latitude: def.latitude,
        longitude: def.longitude,
        webAddress: (def as any).webAddress,
        linkedinUrl: (def as any).linkedinUrl,
        instagramUrl: (def as any).instagramUrl,
        countryCode: def.countryCode,
        verified: def.verified,
        featured: def.featured ?? false,
        homeFeatured: (def as any).homeFeatured ?? false,
        mapFeatured: (def as any).mapFeatured ?? false,
        foundingExpert: def.foundingExpert ?? false,
        allowBooking: def.allowBooking ?? false,
      },
      create: {
        name: def.name,
        email: def.email,
        phone: def.phone,
        whatsapp: def.whatsapp,
        isBusiness: def.isBusiness,
        businessName: (def as any).businessName,
        contactPerson: (def as any).contactPerson,
        bio: def.bio,
        shortDesc: def.shortDesc,
        profileLink: def.profileLink,
        officeAddress: def.officeAddress,
        mapLocation: def.mapLocation,
        latitude: def.latitude,
        longitude: def.longitude,
        webAddress: (def as any).webAddress,
        linkedinUrl: (def as any).linkedinUrl,
        instagramUrl: (def as any).instagramUrl,
        countryCode: def.countryCode,
        verified: def.verified,
        featured: def.featured ?? false,
        homeFeatured: (def as any).homeFeatured ?? false,
        mapFeatured: (def as any).mapFeatured ?? false,
        foundingExpert: def.foundingExpert ?? false,
        foundingExpertSince: def.foundingExpert ? new Date('2025-01-01') : null,
        allowBooking: def.allowBooking ?? false,
      },
    });

    // Attach categories
    for (const catName of def.categoryNames) {
      const slug = slugify(catName);
      const category = await prisma.category.findUnique({
        where: { countryCode_slug: { countryCode: def.countryCode, slug } },
      });
      if (category) {
        await prisma.expertCategory.upsert({
          where: { expertId_categoryId: { expertId: expert.id, categoryId: category.id } },
          update: {},
          create: { expertId: expert.id, categoryId: category.id },
        });
      }
    }

    // Seed services
    await prisma.service.deleteMany({ where: { expertId: expert.id } });
    for (const svc of def.services) {
      await prisma.service.create({
        data: {
          expertId: expert.id,
          name: svc.name,
          price: svc.price,
          duration: svc.duration,
          description: svc.description,
          rateType: svc.rateType,
          availableForBooking: svc.availableForBooking,
        },
      });
    }

    // Seed availability
    await prisma.expertAvailability.deleteMany({ where: { expertId: expert.id } });
    for (const av of def.availability) {
      await prisma.expertAvailability.create({
        data: { expertId: expert.id, dayOfWeek: av.dayOfWeek, startTime: av.startTime, endTime: av.endTime },
      });
    }

    console.log(`  ✓ ${def.name} (${def.countryCode.toUpperCase()})`);
  }

  console.log('\n👤 Seeding admin user...');
  const adminPass = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@expertnear.me' },
    update: {},
    create: { email: 'admin@expertnear.me', password: adminPass, name: 'Admin', role: 'ADMIN', verified: true },
  });
  console.log('  ✓ admin@expertnear.me (password: admin123)');

  console.log('\n⚙️  Seeding default settings...');
  const settings = [
    { key: 'siteName',                  value: 'ExpertNear.Me' },
    { key: 'emailVerificationRequired', value: 'false' },
    { key: 'maintenanceMode',           value: 'false' },
    { key: 'foundingExpertPrice',       value: '999' },
    { key: 'foundingExpertMaxSpots',    value: '500' },
    { key: 'bookingFeeMin',             value: '10' },
    { key: 'bookingFeeMax',             value: '50' },
    { key: 'bookingFeeDefault',         value: '25' },
    { key: 'bookingFeeEnabled',         value: 'true' },
    { key: 'platformCommissionPct',     value: '50' },
    { key: 'agentCommissionPct',        value: '50' },
    { key: 'expertSubscriptionCommissionPct', value: '20' },
  ];
  for (const s of settings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: { value: s.value }, create: s });
  }
  console.log(`  ✓ ${settings.length} settings`);

  console.log('\n✅ Seed complete!');
  console.log(`   Countries  : ${COUNTRIES.length}`);
  console.log(`   Categories : ${COUNTRIES.length * CATEGORY_DEFS.length}`);
  console.log(`   Experts    : ${EXPERT_DEFS.length}`);
}

main()
  .then(async () => {
    console.log("Seed data inserted successfully");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });