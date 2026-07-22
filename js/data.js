// ============================================================
// AgroSmartHub 3.0 — Mock Data & Constants
// ============================================================

const ASH = {
  // ─── APP CONFIG ───
  version: '3.0.0',
  name: 'AgroSmartHub',

  // ─── DEMO USERS ───
  users: {
    farmer: {
      id: 'F-20241001',
      name: 'Ramu Kumar',
      email: 'ramu@farmer.com',
      password: 'farmer123',
      role: 'farmer',
      mobile: '+91 9876543210',
      state: 'Tamil Nadu',
      district: 'Coimbatore',
      aadhaar: '1234 5678 9012',
      farmName: "Ramu's Green Agro Farm",
      landSize: '12.5 acres',
      soilType: 'Black Soil',
      irrigationType: 'Drip Irrigation',
      primaryCrop: 'Tomato',
      farmingType: 'Organic',
      gps: '11.0168° N, 76.9558° E',
      avatar: 'RK',
      avatarColor: '#16a34a',
      verified: true,
      certCount: 18,
      totalSales: 284500,
      rating: 4.8
    },
    buyer: {
      id: 'B-20240302',
      name: 'Priya Krishnaswamy',
      email: 'priya@buyer.com',
      password: 'buyer123',
      role: 'buyer',
      mobile: '+91 9988776655',
      company: 'FreshMart Organics',
      state: 'Karnataka',
      avatar: 'PK',
      avatarColor: '#0d9488',
      verified: true
    },
    admin: {
      id: 'A-00001',
      name: 'Admin User',
      email: 'admin@agrismarthub.com',
      password: 'admin123',
      role: 'admin',
      avatar: 'AU',
      avatarColor: '#7c3aed',
      verified: true
    },
    expert: {
      id: 'E-20240801',
      name: 'Dr. Suresh Patel',
      email: 'expert@agri.com',
      password: 'expert123',
      role: 'expert',
      specialization: 'Soil Science & Crop Protection',
      qualification: 'PhD Agriculture, IARI',
      avatar: 'SP',
      avatarColor: '#2563eb',
      verified: true,
      consultations: 342
    }
  },

  // ─── NAVIGATION BY ROLE ───
  navConfig: {
    farmer: [
      { section: 'Main', items: [
        { id: 'dashboard', label: 'Dashboard', icon: '🏠', badge: null },
        { id: 'ai-detection', label: 'AI Crop Health', icon: '🔬', badge: 'New' },
        { id: 'iot-monitor', label: 'IoT Monitor', icon: '📡', badge: null },
        { id: 'advisor', label: 'Smart Advisor', icon: '🤖', badge: null },
      ]},
      { section: 'Business', items: [
        { id: 'my-products', label: 'My Products', icon: '🌽', badge: null },
        { id: 'certificates', label: 'Certificates', icon: '🏅', badge: null },
        { id: 'orders', label: 'Orders', icon: '📦', badge: '3' },
        { id: 'revenue', label: 'Revenue', icon: '💰', badge: null },
      ]},
      { section: 'Discover', items: [
        { id: 'market-prices', label: 'Market Prices', icon: '📈', badge: null },
        { id: 'supply-chain', label: 'Supply Chain', icon: '🗺️', badge: null },
        { id: 'community', label: 'Community', icon: '👥', badge: null },
        { id: 'notifications', label: 'Notifications', icon: '🔔', badge: '5' },
      ]}
    ],
    buyer: [
      { section: 'Main', items: [
        { id: 'dashboard', label: 'Dashboard', icon: '🏠', badge: null },
        { id: 'marketplace', label: 'Marketplace', icon: '🛒', badge: null },
        { id: 'orders', label: 'My Orders', icon: '📦', badge: '2' },
        { id: 'supply-chain', label: 'Track Orders', icon: '🗺️', badge: null },
      ]},
      { section: 'Tools', items: [
        { id: 'verify-cert', label: 'Verify Certificate', icon: '✅', badge: null },
        { id: 'notifications', label: 'Notifications', icon: '🔔', badge: '2' },
      ]}
    ],
    admin: [
      { section: 'Management', items: [
        { id: 'dashboard', label: 'Dashboard', icon: '🏠', badge: null },
        { id: 'manage-farmers', label: 'Farmers', icon: '🧑‍🌾', badge: null },
        { id: 'manage-buyers', label: 'Buyers', icon: '🛒', badge: null },
        { id: 'approve-certs', label: 'Approve Certs', icon: '🏅', badge: '7' },
        { id: 'manage-orders', label: 'Orders', icon: '📦', badge: null },
      ]},
      { section: 'Analytics', items: [
        { id: 'analytics', label: 'Analytics', icon: '📊', badge: null },
        { id: 'reports', label: 'Reports', icon: '📋', badge: null },
      ]}
    ],
    expert: [
      { section: 'Main', items: [
        { id: 'dashboard', label: 'Dashboard', icon: '🏠', badge: null },
        { id: 'consultations', label: 'Consultations', icon: '📋', badge: '4' },
        { id: 'approve-certs', label: 'Review Certs', icon: '🏅', badge: '7' },
        { id: 'community', label: 'Community', icon: '👥', badge: null },
      ]}
    ]
  },

  // ─── FEATURES DATA ───
  features: [
    { icon: '🤖', title: 'AI Crop Health Detection', desc: 'Upload a photo and our YOLOv8 AI instantly detects 12+ diseases with confidence scores, severity levels, and treatment recommendations.', tags: ['YOLOv8', 'TensorFlow', 'Real-time'] },
    { icon: '📡', title: 'Real-Time IoT Monitoring', desc: 'Monitor 10+ soil and environmental sensors live. Get instant alerts when values go abnormal with historical trend charts.', tags: ['IoT', 'Live Data', 'Alerts'] },
    { icon: '🏅', title: 'Digital Quality Certificates', desc: 'Generate blockchain-verified quality certificates with QR codes, expert signatures, and grade ratings after AI analysis.', tags: ['Blockchain', 'QR Code', 'PDF'] },
    { icon: '🛒', title: 'Smart Marketplace', desc: 'Sell certified produce directly to buyers. Filter by quality grade, location, and AI certification status for maximum trust.', tags: ['Direct Trade', 'Certified', 'Secure Pay'] },
    { icon: '🗺️', title: 'Supply Chain Intelligence', desc: 'Real-time tracking from farm to customer with interactive maps. Know exactly where your produce is at every step.', tags: ['GPS Tracking', 'Live Maps', 'Logistics'] },
    { icon: '💹', title: 'AI Market Price Prediction', desc: 'Predict the best time to sell with AI-powered demand forecasting, price trend analysis, and profit estimation.', tags: ['Price AI', 'Forecasting', 'Analytics'] },
    { icon: '🌾', title: 'Smart Crop Advisor', desc: 'Get personalized recommendations for crop selection, fertilizers, pesticides, water schedule, and government schemes.', tags: ['AI Advisory', 'Personalized', 'Schemes'] },
    { icon: '👥', title: 'Farmer Community', desc: 'Connect with 50,000+ farmers. Ask experts, share experiences, watch training videos, and participate in forums.', tags: ['Community', 'Expert Q&A', 'Videos'] }
  ],

  // ─── TESTIMONIALS ───
  testimonials: [
    { name: 'Arjun Reddy', location: 'Andhra Pradesh', role: 'Paddy Farmer', avatar: 'AR', avatarColor: '#16a34a', stars: 5, text: '"AgroSmartHub\'s AI detected early blight on my paddy crop before it could spread. I saved 40% more yield this season thanks to timely treatment recommendations!"' },
    { name: 'Meena Devi', location: 'Rajasthan', role: 'Cotton Farmer', avatar: 'MD', avatarColor: '#0d9488', stars: 5, text: '"The IoT sensors alert me instantly when soil moisture drops. I no longer over-irrigate. Saved ₹25,000 on water bills in one season. Incredible platform!"' },
    { name: 'Suresh Patil', location: 'Maharashtra', role: 'Soybean Farmer', avatar: 'SP', avatarColor: '#2563eb', stars: 5, text: '"Got my organic certification through AgroSmartHub and premium buyers started paying 35% more. The supply chain tracking gives buyers confidence in my produce."' },
    { name: 'Lakshmi Bai', location: 'Tamil Nadu', role: 'Vegetable Farmer', avatar: 'LB', avatarColor: '#7c3aed', stars: 5, text: '"The market price prediction told me to wait 2 weeks before selling my tomatoes. I did, and earned ₹18,000 more than my neighbors who sold early!"' },
    { name: 'Rahul Sharma', location: 'Punjab', role: 'Wheat Farmer', avatar: 'RS', avatarColor: '#ea580c', stars: 5, text: '"Registration was simple even for a farmer like me who is not tech-savvy. The OTP login and multilingual support in Hindi made everything easy."' },
    { name: 'Prabhavati', location: 'Karnataka', role: 'Horticulture Farmer', avatar: 'PR', avatarColor: '#db2777', stars: 4, text: '"Excellent platform for connecting with buyers directly without middlemen. My income has increased by 60% since joining AgroSmartHub 3.0!"' }
  ],

  // ─── PRODUCTS ───
  products: [
    { id: 'P001', emoji: '🍅', name: 'Organic Tomatoes', farmer: 'Ramu Kumar', location: 'Coimbatore, TN', price: 45, unit: 'kg', quantity: 500, grade: 'A', certified: true, category: 'vegetables', desc: 'Fresh organic tomatoes grown using drip irrigation. No pesticides used.' },
    { id: 'P002', emoji: '🌾', name: 'Basmati Rice (Grade 1)', farmer: 'Arjun Reddy', location: 'Nellore, AP', price: 120, unit: 'kg', quantity: 2000, grade: 'A', certified: true, category: 'grains', desc: 'Premium basmati rice with natural aroma. Traditionally grown.' },
    { id: 'P003', emoji: '🧅', name: 'Red Onion', farmer: 'Meena Devi', location: 'Nashik, MH', price: 28, unit: 'kg', quantity: 800, grade: 'B', certified: true, category: 'vegetables', desc: 'Fresh red onions harvested last week. Excellent storage quality.' },
    { id: 'P004', emoji: '🥔', name: 'Kufri Potato', farmer: 'Suresh Patil', location: 'Shimla, HP', price: 35, unit: 'kg', quantity: 1200, grade: 'A', certified: false, category: 'vegetables', desc: 'Mountain grown potatoes with excellent flavor and texture.' },
    { id: 'P005', emoji: '🌽', name: 'Sweet Corn (Hybrid)', farmer: 'Rahul Sharma', location: 'Ludhiana, PB', price: 22, unit: 'kg', quantity: 600, grade: 'A', certified: true, category: 'grains', desc: 'Super sweet hybrid corn variety. Perfect for fresh consumption.' },
    { id: 'P006', emoji: '🍌', name: 'Robusta Banana', farmer: 'Lakshmi Bai', location: 'Thanjavur, TN', price: 40, unit: 'dozen', quantity: 300, grade: 'A', certified: true, category: 'fruits', desc: 'Naturally ripened robusta bananas. Rich in potassium.' },
    { id: 'P007', emoji: '🥦', name: 'Broccoli', farmer: 'Prabhavati', location: 'Ooty, TN', price: 80, unit: 'kg', quantity: 200, grade: 'A', certified: true, category: 'vegetables', desc: 'Fresh broccoli from Nilgiris. No pesticides.' },
    { id: 'P008', emoji: '🫑', name: 'Capsicum (Mixed)', farmer: 'Ramu Kumar', location: 'Coimbatore, TN', price: 60, unit: 'kg', quantity: 150, grade: 'A', certified: true, category: 'vegetables', desc: 'Mixed colored capsicums. Red, yellow, and green.' },
    { id: 'P009', emoji: '🌱', name: 'Organic Seeds Pack', farmer: 'Arjun Reddy', location: 'Nellore, AP', price: 250, unit: 'pack', quantity: 100, grade: 'A', certified: true, category: 'seeds', desc: 'Certified organic seed pack with 10 variety vegetables.' }
  ],

  // ─── IoT SENSORS ───
  sensors: [
    { id: 'temp', label: 'Temperature', emoji: '🌡️', unit: '°C', min: 15, max: 40, normal: [20, 32], value: 26.4 },
    { id: 'humidity', label: 'Humidity', emoji: '💧', unit: '%', min: 20, max: 100, normal: [40, 80], value: 72 },
    { id: 'soil_moisture', label: 'Soil Moisture', emoji: '🌱', unit: '%', min: 0, max: 100, normal: [30, 70], value: 58 },
    { id: 'soil_ph', label: 'Soil pH', emoji: '⚗️', unit: 'pH', min: 4, max: 9, normal: [5.5, 7.5], value: 6.4 },
    { id: 'light', label: 'Light Intensity', emoji: '☀️', unit: 'lux', min: 0, max: 100000, normal: [10000, 80000], value: 42000 },
    { id: 'rainfall', label: 'Rainfall', emoji: '🌧️', unit: 'mm', min: 0, max: 200, normal: [0, 80], value: 12 },
    { id: 'wind', label: 'Wind Speed', emoji: '🌬️', unit: 'km/h', min: 0, max: 80, normal: [0, 40], value: 8 },
    { id: 'water_tank', label: 'Water Tank', emoji: '🪣', unit: '%', min: 0, max: 100, normal: [20, 95], value: 76 },
    { id: 'co2', label: 'CO₂ Level', emoji: '🫧', unit: 'ppm', min: 300, max: 2000, normal: [350, 800], value: 412 },
    { id: 'air_quality', label: 'Air Quality', emoji: '🌿', unit: 'AQI', min: 0, max: 300, normal: [0, 100], value: 38 }
  ],

  // ─── AI DISEASE DATABASE ───
  diseases: [
    { name: 'Healthy Crop', emoji: '✅', severity: 'healthy', confidence: [92, 99], healthPct: [85, 99], affectedArea: '0%', medicine: 'None required', fertilizer: 'Continue NPK schedule', water: 'Maintain current schedule', yieldLoss: '0%', recovery: 'N/A — Crop is healthy', risk: 'Low risk. Continue preventive care.' },
    { name: 'Early Leaf Blight', emoji: '🍂', severity: 'low', confidence: [78, 92], healthPct: [60, 80], affectedArea: '5-15%', medicine: 'Mancozeb 75 WP @ 2g/L', fertilizer: 'Potassium Nitrate supplement', water: 'Reduce foliar wetness', yieldLoss: '5-15%', recovery: '10-14 days with treatment', risk: 'Can spread to 40% in 3 weeks if untreated.' },
    { name: 'Late Blight (Phytophthora)', emoji: '⚠️', severity: 'high', confidence: [85, 96], healthPct: [30, 55], affectedArea: '25-60%', medicine: 'Metalaxyl + Mancozeb @ 2.5g/L', fertilizer: 'Phosphorus booster', water: 'Avoid overhead irrigation', yieldLoss: '30-60%', recovery: '14-21 days with intensive treatment', risk: 'Highly contagious. Isolate affected plants immediately.' },
    { name: 'Powdery Mildew', emoji: '💨', severity: 'medium', confidence: [80, 93], healthPct: [50, 72], affectedArea: '10-30%', medicine: 'Sulphur 80 WP @ 3g/L', fertilizer: 'Reduce nitrogen, increase potassium', water: 'Improve air circulation', yieldLoss: '10-25%', recovery: '7-14 days', risk: 'Spreads rapidly in dry hot conditions.' },
    { name: 'Leaf Rust', emoji: '🟤', severity: 'medium', confidence: [83, 95], healthPct: [45, 70], affectedArea: '15-35%', medicine: 'Propiconazole 25 EC @ 1ml/L', fertilizer: 'Balanced NPK', water: 'Normal schedule', yieldLoss: '15-30%', recovery: '10-18 days', risk: 'Wind-borne spores can spread to adjacent fields.' },
    { name: 'Bacterial Wilt', emoji: '😷', severity: 'critical', confidence: [88, 97], healthPct: [10, 35], affectedArea: '40-90%', medicine: 'Copper oxychloride + Streptocycline', fertilizer: 'Avoid high nitrogen', water: 'Improve drainage immediately', yieldLoss: '50-100%', recovery: 'Poor — Remove infected plants', risk: 'Critical: soil-borne, can persist for years.' },
    { name: 'Aphid Pest Attack', emoji: '🐛', severity: 'medium', confidence: [82, 94], healthPct: [55, 75], affectedArea: '10-25%', medicine: 'Imidacloprid 17.8 SL @ 0.5ml/L', fertilizer: 'No change required', water: 'Water spray to dislodge aphids', yieldLoss: '10-20%', recovery: '5-10 days', risk: 'Also transmits viral diseases to neighboring plants.' },
    { name: 'Nitrogen Deficiency', emoji: '🟡', severity: 'low', confidence: [76, 90], healthPct: [55, 78], affectedArea: 'Whole plant', medicine: 'Not applicable', fertilizer: 'Urea @ 25kg/acre immediately', water: 'Increase frequency slightly', yieldLoss: '10-20%', recovery: '7-12 days after fertilization', risk: 'Can worsen if not addressed. Foliar spray recommended.' },
    { name: 'Water Stress (Drought)', emoji: '💧', severity: 'high', confidence: [87, 95], healthPct: [25, 50], affectedArea: 'Whole plant', medicine: 'Anti-transpirant spray', fertilizer: 'Suspend heavy fertilization', water: 'Immediate irrigation — 50mm depth', yieldLoss: '25-45%', recovery: '5-8 days after irrigation', risk: 'Severe wilting leads to irreversible cell damage.' }
  ],

  // ─── NOTIFICATIONS ───
  notifications: [
    { id: 1, icon: '🔬', title: 'AI Analysis Complete', desc: 'Your tomato crop scan shows Early Leaf Blight. Treatment recommended.', time: '5 min ago', type: 'ai', unread: true },
    { id: 2, icon: '📦', title: 'Order Received', desc: 'Priya Krishnaswamy ordered 50kg Organic Tomatoes. ₹2,250 pending.', time: '23 min ago', type: 'order', unread: true },
    { id: 3, icon: '🌧️', title: 'Rain Alert', desc: 'Heavy rainfall expected in Coimbatore tomorrow. Secure your crops.', time: '1 hr ago', type: 'weather', unread: true },
    { id: 4, icon: '💰', title: 'Payment Received', desc: 'Payment of ₹4,500 received for Order #ORD-2024091801.', time: '3 hrs ago', type: 'payment', unread: false },
    { id: 5, icon: '🏅', title: 'Certificate Approved', desc: 'Your Quality Certificate CERT-TN-2024-0847 has been approved by expert.', time: '5 hrs ago', type: 'cert', unread: false },
    { id: 6, icon: '📈', title: 'Price Alert', desc: 'Tomato prices up 15% in your region. Best time to sell!', time: '8 hrs ago', type: 'price', unread: false },
    { id: 7, icon: '🌾', title: 'Harvest Reminder', desc: 'Your Maize crop is ready for harvest in 7 days. Schedule logistics.', time: '1 day ago', type: 'harvest', unread: false }
  ],

  // ─── MARKET PRICES ───
  marketPrices: [
    { crop: 'Tomato', emoji: '🍅', price: 4500, change: +12.3, unit: 'per quintal', market: 'Coimbatore' },
    { crop: 'Onion', emoji: '🧅', price: 2800, change: -5.2, unit: 'per quintal', market: 'Nashik' },
    { crop: 'Potato', emoji: '🥔', price: 3500, change: +3.8, unit: 'per quintal', market: 'Agra' },
    { crop: 'Rice', emoji: '🌾', price: 12000, change: +1.5, unit: 'per quintal', market: 'Nellore' },
    { crop: 'Wheat', emoji: '🌿', price: 2200, change: +0.8, unit: 'per quintal', market: 'Ludhiana' },
    { crop: 'Maize', emoji: '🌽', price: 2140, change: +3.2, unit: 'per quintal', market: 'Rajkot' },
    { crop: 'Cotton', emoji: '☁️', price: 6800, change: -2.1, unit: 'per quintal', market: 'Nagpur' },
    { crop: 'Banana', emoji: '🍌', price: 1800, change: +8.4, unit: 'per quintal', market: 'Jalgaon' }
  ],

  // ─── SUPPLY CHAIN NODES ───
  supplyNodes: [
    { id: 1, name: 'Farm Collection', location: "Ramu's Farm, Coimbatore", status: 'done', time: 'Jul 8, 09:00 AM', emoji: '🌾', lat: 11.0168, lng: 76.9558 },
    { id: 2, name: 'Quality Check', location: 'AgroSmartHub Lab, Coimbatore', status: 'done', time: 'Jul 8, 11:30 AM', emoji: '🔬', lat: 11.0218, lng: 76.9668 },
    { id: 3, name: 'Cold Storage', location: 'FreshPro Warehouse, Coimbatore', status: 'done', time: 'Jul 8, 02:00 PM', emoji: '🏭', lat: 11.0118, lng: 76.9458 },
    { id: 4, name: 'In Transit', location: 'On route to Bangalore', status: 'active', time: 'Jul 9, 06:00 AM', emoji: '🚛', lat: 12.2958, lng: 76.6394 },
    { id: 5, name: 'Distribution Center', location: 'FreshMart DC, Bangalore', status: 'pending', time: 'Expected Jul 9, 04:00 PM', emoji: '🏪', lat: 12.9716, lng: 77.5946 },
    { id: 6, name: 'Delivered', location: "Buyer's Location, Bangalore", status: 'pending', time: 'Expected Jul 10, 10:00 AM', emoji: '✅', lat: 12.9352, lng: 77.6245 }
  ],

  // ─── ADMIN DATA ───
  allFarmers: [
    { id: 'F-001', name: 'Ramu Kumar', state: 'Tamil Nadu', crop: 'Tomato', certs: 18, revenue: '₹2.84L', status: 'active', joined: 'Jan 2024' },
    { id: 'F-002', name: 'Arjun Reddy', state: 'Andhra Pradesh', crop: 'Paddy', certs: 12, revenue: '₹1.92L', status: 'active', joined: 'Feb 2024' },
    { id: 'F-003', name: 'Meena Devi', state: 'Rajasthan', crop: 'Cotton', certs: 7, revenue: '₹98K', status: 'active', joined: 'Mar 2024' },
    { id: 'F-004', name: 'Suresh Patil', state: 'Maharashtra', crop: 'Soybean', certs: 21, revenue: '₹3.15L', status: 'active', joined: 'Dec 2023' },
    { id: 'F-005', name: 'Rahul Sharma', state: 'Punjab', crop: 'Wheat', certs: 9, revenue: '₹1.45L', status: 'pending', joined: 'Apr 2024' },
    { id: 'F-006', name: 'Lakshmi Bai', state: 'Tamil Nadu', crop: 'Banana', certs: 5, revenue: '₹72K', status: 'active', joined: 'May 2024' }
  ],

  pendingCerts: [
    { id: 'CERT-TN-2024-0901', farmer: 'Ramu Kumar', crop: 'Tomato', grade: 'A', date: 'Jul 8, 2025', score: 94 },
    { id: 'CERT-AP-2024-0902', farmer: 'Arjun Reddy', crop: 'Paddy', grade: 'A+', date: 'Jul 8, 2025', score: 97 },
    { id: 'CERT-MH-2024-0903', farmer: 'Suresh Patil', crop: 'Soybean', grade: 'B', date: 'Jul 9, 2025', score: 78 },
    { id: 'CERT-RJ-2024-0904', farmer: 'Meena Devi', crop: 'Cotton', grade: 'A', date: 'Jul 9, 2025', score: 88 }
  ],

  // ─── COMMUNITY POSTS ───
  communityPosts: [
    { id: 1, author: 'Ramu Kumar', role: 'Farmer', avatar: 'RK', avatarColor: '#16a34a', time: '2h ago', content: 'My tomato plants have yellow leaves despite regular watering. Could this be nutrient deficiency or overwatering? Anyone faced this issue? The lower leaves are turning yellow first.', likes: 24, replies: 8, tags: ['tomato', 'yellowing', 'help'] },
    { id: 2, author: 'Dr. Suresh Patel', role: 'Agricultural Expert', avatar: 'SP', avatarColor: '#2563eb', time: '3h ago', content: '✅ EXPERT TIP: For tomato yellowing starting from lower leaves — this is classic Nitrogen deficiency OR overwatering. Check soil moisture first with a meter. If >70%, reduce watering. If normal, apply Urea foliar spray @2% concentration. Results in 5-7 days.', likes: 67, replies: 15, tags: ['expert-advice', 'tomato', 'nutrition'] },
    { id: 3, author: 'Arjun Reddy', role: 'Farmer', avatar: 'AR', avatarColor: '#0d9488', time: '5h ago', content: 'The AI Crop Health scanner saved my paddy crop! It detected Blast disease at 4% spread stage. I never would have noticed it. After applying tricyclazole, my crop is now 97% healthy. 10/10 platform! 🙏', likes: 142, replies: 31, tags: ['success-story', 'paddy', 'AI'] },
    { id: 4, author: 'Meena Devi', role: 'Farmer', avatar: 'MD', avatarColor: '#7c3aed', time: '8h ago', content: 'Government scheme alert! PM Kisan Samman Nidhi - last date for registration extended to July 31st. Make sure you register before that. The AgroSmartHub team can help with documentation. 📢', likes: 89, replies: 22, tags: ['government-scheme', 'PM-Kisan', 'alert'] }
  ],

  // ─── ADVISOR RECOMMENDATIONS ───
  advisorRecs: [
    { category: '🌾 Best Crop', rec: 'Based on your soil type (Black) and current weather, Tomato and Cotton are ideal this season. Expected profit: ₹65,000/acre.', priority: 'high' },
    { category: '💧 Water Schedule', rec: 'Drip irrigation recommended: 20 minutes every alternate day. Soil moisture currently at 58% — optimal range.', priority: 'medium' },
    { category: '🧪 Fertilizer', rec: 'Apply NPK 19:19:19 @ 5kg per acre this week. Follow with potassium sulphate in 10 days for fruiting support.', priority: 'high' },
    { category: '🌿 Pest Prevention', rec: 'Yellow sticky traps recommended to monitor aphid population. No chemical treatment needed yet — population below threshold.', priority: 'low' },
    { category: '📅 Harvest', rec: 'Your tomato crop is ready for harvest in 12-15 days. Market prices trending up — wait for peak price window.', priority: 'medium' },
    { category: '🏛️ Government Schemes', rec: 'You are eligible for PM Fasal Bima Yojana (Crop Insurance). Apply before July 31st for kharif season coverage.', priority: 'high' }
  ]
};

// ─── UTILITY FUNCTIONS ───
function genId(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}
function genBlockchainId() {
  const chars = '0123456789abcdef';
  return Array.from({length: 64}, () => chars[Math.floor(Math.random() * 16)]).join('');
}
function genCertId(state, crop) {
  const st = state ? state.substring(0,2).toUpperCase() : 'IN';
  return `CERT-${st}-2025-${Math.floor(Math.random()*9000+1000)}`;
}
function randomBetween(min, max) { return (Math.random()*(max-min)+min); }
function randomInt(min, max) { return Math.floor(randomBetween(min, max)); }
function fmtCurrency(n) { return new Intl.NumberFormat('en-IN', {style:'currency',currency:'INR',maximumFractionDigits:0}).format(n); }
function fmtNum(n) {
  if(n >= 10000000) return (n/10000000).toFixed(1) + 'Cr';
  if(n >= 100000) return (n/100000).toFixed(1) + 'L';
  if(n >= 1000) return (n/1000).toFixed(1) + 'K';
  return n.toString();
}

// ─── SESSION STORAGE ───
// Uses localStorage so session persists across page reloads/navigation
// Uses var to allow safe redeclaration across script blocks
var Session = {
  set: (key, val) => { try { localStorage.setItem(`ash_${key}`, JSON.stringify(val)); } catch(e){} },
  get: (key) => { try { const v = localStorage.getItem(`ash_${key}`); return v ? JSON.parse(v) : null; } catch(e){ return null; } },
  del: (key) => { try { localStorage.removeItem(`ash_${key}`); } catch(e){} },
  clear: () => { try { localStorage.removeItem('ash_user'); } catch(e){} }
};
