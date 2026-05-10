import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.postComment.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.communityPost.deleteMany();
  await prisma.savedDestination.deleteMany();
  await prisma.tripEditHistory.deleteMany();
  await prisma.tripCollaborator.deleteMany();
  await prisma.tripDocument.deleteMany();
  await prisma.tripNote.deleteMany();
  await prisma.packingItem.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.itineraryItem.deleteMany();
  await prisma.tripStop.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.city.deleteMany();
  await prisma.checklistTemplate.deleteMany();
  await prisma.user.deleteMany();
  console.log('Cleared existing data');

  const pw = await bcrypt.hash('Admin123!', 12);
  const upw = await bcrypt.hash('User123!', 12);

  const admin = await prisma.user.create({ data: { email:'admin@traveloop.app', passwordHash:pw, firstName:'Admin', lastName:'User', role:'admin', city:'San Francisco', country:'USA', bio:'Traveloop administrator', username:'admin' }});
  const user1 = await prisma.user.create({ data: { email:'john@example.com', passwordHash:upw, firstName:'John', lastName:'Traveler', city:'New York', country:'USA', bio:'Adventure seeker and food lover. 🌍', username:'johntravels' }});
  const user2 = await prisma.user.create({ data: { email:'sarah@example.com', passwordHash:upw, firstName:'Sarah', lastName:'Explorer', city:'London', country:'UK', bio:'Solo traveler and photographer. 📸', username:'sarahexplores' }});
  const user3 = await prisma.user.create({ data: { email:'mike@example.com', passwordHash:upw, firstName:'Mike', lastName:'Wanderer', city:'Berlin', country:'Germany', bio:'Digital nomad exploring the world.', username:'mikewanders' }});
  const user4 = await prisma.user.create({ data: { email:'emma@example.com', passwordHash:upw, firstName:'Emma', lastName:'Adventurer', city:'Sydney', country:'Australia', bio:'Beach lover and scuba diver. 🏊‍♀️', username:'emmaadventures' }});
  const user5 = await prisma.user.create({ data: { email:'carlos@example.com', passwordHash:upw, firstName:'Carlos', lastName:'Voyager', city:'Madrid', country:'Spain', bio:'Foodie exploring world cuisines. 🍴', username:'carlosvoyages' }});
  const user6 = await prisma.user.create({ data: { email:'yuki@example.com', passwordHash:upw, firstName:'Yuki', lastName:'Nomad', city:'Tokyo', country:'Japan', bio:'Remote worker traveling Asia. 💻', username:'yukinomad' }});
  console.log('Created 7 users');

  const cityData = [
    { name:'Tokyo', country:'Japan', region:'Asia', latitude:35.6762, longitude:139.6503, costIndex:4.2, popularity:95, imageUrl:'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', description:'Ultra-modern meets traditional' },
    { name:'Bangkok', country:'Thailand', region:'Asia', latitude:13.7563, longitude:100.5018, costIndex:2.1, popularity:88, imageUrl:'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800', description:'Vibrant street life and temples' },
    { name:'Bali', country:'Indonesia', region:'Asia', latitude:-8.3405, longitude:115.0920, costIndex:2.0, popularity:90, imageUrl:'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', description:'Tropical paradise with rice terraces' },
    { name:'Paris', country:'France', region:'Europe', latitude:48.8566, longitude:2.3522, costIndex:4.0, popularity:98, imageUrl:'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', description:'City of Light and romance' },
    { name:'Barcelona', country:'Spain', region:'Europe', latitude:41.3851, longitude:2.1734, costIndex:3.2, popularity:92, imageUrl:'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800', description:'Gaudí architecture and beaches' },
    { name:'Rome', country:'Italy', region:'Europe', latitude:41.9028, longitude:12.4964, costIndex:3.5, popularity:94, imageUrl:'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800', description:'Ancient history and cuisine' },
    { name:'London', country:'UK', region:'Europe', latitude:51.5074, longitude:-0.1278, costIndex:4.5, popularity:96, imageUrl:'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800', description:'Historic landmarks and culture' },
    { name:'New York', country:'USA', region:'North America', latitude:40.7128, longitude:-74.0060, costIndex:4.8, popularity:97, imageUrl:'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800', description:'City that never sleeps' },
    { name:'Dubai', country:'UAE', region:'Middle East', latitude:25.2048, longitude:55.2708, costIndex:4.3, popularity:91, imageUrl:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', description:'Futuristic luxury in the desert' },
    { name:'Sydney', country:'Australia', region:'Oceania', latitude:-33.8688, longitude:151.2093, costIndex:4.0, popularity:93, imageUrl:'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800', description:'Iconic harbor and beaches' },
    { name:'Istanbul', country:'Turkey', region:'Europe', latitude:41.0082, longitude:28.9784, costIndex:2.5, popularity:87, imageUrl:'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800', description:'Where East meets West' },
    { name:'Amsterdam', country:'Netherlands', region:'Europe', latitude:52.3676, longitude:4.9041, costIndex:3.8, popularity:89, imageUrl:'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800', description:'Canals, bikes, and art' },
    { name:'Prague', country:'Czech Republic', region:'Europe', latitude:50.0755, longitude:14.4378, costIndex:2.8, popularity:85, imageUrl:'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800', description:'Fairy-tale medieval city' },
    { name:'Lisbon', country:'Portugal', region:'Europe', latitude:38.7223, longitude:-9.1393, costIndex:2.9, popularity:86, imageUrl:'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800', description:'Colorful tiles and pastel de nata' },
    { name:'Seoul', country:'South Korea', region:'Asia', latitude:37.5665, longitude:126.9780, costIndex:3.3, popularity:84, imageUrl:'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800', description:'K-culture and street food' },
    { name:'Cape Town', country:'South Africa', region:'Africa', latitude:-33.9249, longitude:18.4241, costIndex:2.4, popularity:82, imageUrl:'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800', description:'Table Mountain and vineyards' },
    { name:'Rio de Janeiro', country:'Brazil', region:'South America', latitude:-22.9068, longitude:-43.1729, costIndex:2.6, popularity:83, imageUrl:'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800', description:'Carnival, beaches, and samba' },
    { name:'Singapore', country:'Singapore', region:'Asia', latitude:1.3521, longitude:103.8198, costIndex:4.1, popularity:90, imageUrl:'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800', description:'Garden city of the future' },
    { name:'Marrakech', country:'Morocco', region:'Africa', latitude:31.6295, longitude:-7.9811, costIndex:1.8, popularity:80, imageUrl:'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800', description:'Souks, spices, and riads' },
    { name:'Vienna', country:'Austria', region:'Europe', latitude:48.2082, longitude:16.3738, costIndex:3.6, popularity:84, imageUrl:'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800', description:'Imperial palaces and classical music' },
    { name:'Santorini', country:'Greece', region:'Europe', latitude:36.3932, longitude:25.4615, costIndex:3.4, popularity:91, imageUrl:'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800', description:'Stunning sunsets and white-blue domes' },
    { name:'Hanoi', country:'Vietnam', region:'Asia', latitude:21.0278, longitude:105.8342, costIndex:1.5, popularity:79, imageUrl:'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800', description:'Ancient charm and pho' },
    { name:'Kyoto', country:'Japan', region:'Asia', latitude:35.0116, longitude:135.7681, costIndex:3.9, popularity:88, imageUrl:'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', description:'Temples, bamboo, and geisha' },
    { name:'Cancún', country:'Mexico', region:'North America', latitude:21.1619, longitude:-86.8515, costIndex:2.7, popularity:86, imageUrl:'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800', description:'Caribbean beaches and Mayan ruins' },
    { name:'Zürich', country:'Switzerland', region:'Europe', latitude:47.3769, longitude:8.5417, costIndex:5.0, popularity:81, imageUrl:'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800', description:'Alpine scenery and chocolate' },
  ];

  const cities = [];
  for (const d of cityData) { cities.push(await prisma.city.create({ data: d })); }
  console.log(`Created ${cities.length} cities`);

  // Activities: 5 per city = 125
  const actTemplates = [
    { name:'Walking Tour', cat:'sightseeing', cMin:20, cMax:50, dur:3 },
    { name:'Food Tour', cat:'food', cMin:40, cMax:80, dur:3 },
    { name:'Museum Visit', cat:'culture', cMin:15, cMax:30, dur:2 },
    { name:'Cooking Class', cat:'food', cMin:50, cMax:100, dur:4 },
    { name:'Adventure Tour', cat:'adventure', cMin:80, cMax:200, dur:4 },
  ];
  let ac=0;
  for (const c of cities) {
    for (const t of actTemplates) {
      await prisma.activity.create({ data:{
        cityId:c.id, name:`${c.name} ${t.name}`, category:t.cat, costMin:t.cMin, costMax:t.cMax, durationHrs:t.dur,
        rating: (3.5+Math.random()*1.5).toFixed(2), isFeatured: Math.random()>0.7,
        description:`Best ${t.name.toLowerCase()} experience in ${c.name}`
      }});
      ac++;
    }
  }
  console.log(`Created ${ac} activities`);

  // Trips
  const now = new Date();
  const d = (base, off) => { const x=new Date(base); x.setDate(x.getDate()+off); return x; };
  const tokyo=cities.find(c=>c.name==='Tokyo'), bali=cities.find(c=>c.name==='Bali');
  const paris=cities.find(c=>c.name==='Paris'), barcelona=cities.find(c=>c.name==='Barcelona'), rome=cities.find(c=>c.name==='Rome');

  const trip1 = await prisma.trip.create({ data:{
    userId:user1.id, title:'Japan Adventure', description:'Exploring the best of Japan - from ancient temples to futuristic cities.',
    startDate:d(now,-3), endDate:d(now,4), status:'ongoing', isPublic:true, totalBudget:3000,
    shareToken: crypto.randomBytes(16).toString('hex'),
    stops:{ create:[{ cityId:tokyo.id, arrivalDate:d(now,-3), departureDate:d(now,4), orderIndex:0 }] }
  }});

  const trip2 = await prisma.trip.create({ data:{
    userId:user2.id, title:'Bali Retreat', description:'Relaxing in paradise with yoga, surfing, and amazing food.',
    startDate:d(now,-60), endDate:d(now,-50), status:'completed', isPublic:true, totalBudget:2000,
    shareToken: crypto.randomBytes(16).toString('hex'),
    stops:{ create:[{ cityId:bali.id, arrivalDate:d(now,-60), departureDate:d(now,-50), orderIndex:0 }] }
  }});

  const trip3 = await prisma.trip.create({ data:{
    userId:user3.id, title:'European Grand Tour', description:'Paris → Barcelona → Rome - the ultimate European experience.',
    startDate:d(now,14), endDate:d(now,35), status:'planned', isPublic:true, totalBudget:5000,
    shareToken: crypto.randomBytes(16).toString('hex'),
    stops:{ create:[
      { cityId:paris.id, arrivalDate:d(now,14), departureDate:d(now,21), orderIndex:0 },
      { cityId:barcelona.id, arrivalDate:d(now,21), departureDate:d(now,28), orderIndex:1 },
      { cityId:rome.id, arrivalDate:d(now,28), departureDate:d(now,35), orderIndex:2 },
    ]}
  }});

  // Draft trip
  const london=cities.find(c=>c.name==='London'), amsterdam=cities.find(c=>c.name==='Amsterdam');
  const trip4 = await prisma.trip.create({ data:{
    userId:user4.id, title:'UK & Netherlands', description:'Still planning this one...',
    startDate:d(now,60), endDate:d(now,70), status:'draft', isPublic:false, totalBudget:3500,
    stops:{ create:[
      { cityId:london.id, arrivalDate:d(now,60), departureDate:d(now,65), orderIndex:0 },
      { cityId:amsterdam.id, arrivalDate:d(now,65), departureDate:d(now,70), orderIndex:1 },
    ]}
  }});

  // Another completed trip
  const singapore=cities.find(c=>c.name==='Singapore');
  const trip5 = await prisma.trip.create({ data:{
    userId:user5.id, title:'Singapore Food Safari', description:'4 days of non-stop eating!',
    startDate:d(now,-30), endDate:d(now,-26), status:'completed', isPublic:true, totalBudget:1500,
    shareToken: crypto.randomBytes(16).toString('hex'),
    stops:{ create:[{ cityId:singapore.id, arrivalDate:d(now,-30), departureDate:d(now,-26), orderIndex:0 }] }
  }});

  // Solo trip
  const kyoto=cities.find(c=>c.name==='Kyoto');
  const trip6 = await prisma.trip.create({ data:{
    userId:user6.id, title:'Kyoto Temple Hopping', description:'Finding zen in ancient Japan.',
    startDate:d(now,-10), endDate:d(now,-5), status:'completed', isPublic:true, totalBudget:1200,
    shareToken: crypto.randomBytes(16).toString('hex'),
    stops:{ create:[{ cityId:kyoto.id, arrivalDate:d(now,-10), departureDate:d(now,-5), orderIndex:0 }] }
  }});

  console.log('Created 6 demo trips');

  // Get stops for itinerary items
  const trip1Stops = await prisma.tripStop.findMany({ where: { tripId: trip1.id } });
  const trip2Stops = await prisma.tripStop.findMany({ where: { tripId: trip2.id } });
  const trip5Stops = await prisma.tripStop.findMany({ where: { tripId: trip5.id } });
  const trip6Stops = await prisma.tripStop.findMany({ where: { tripId: trip6.id } });

  // Get activities for itinerary items
  const tokyoActivities = await prisma.activity.findMany({ where: { cityId: tokyo.id }, take: 5 });
  const baliActivities = await prisma.activity.findMany({ where: { cityId: bali.id }, take: 5 });
  const singaporeActivities = await prisma.activity.findMany({ where: { cityId: singapore.id }, take: 5 });
  const kyotoActivities = await prisma.activity.findMany({ where: { cityId: kyoto.id }, take: 5 });

  // Itinerary items for Tokyo trip
  await prisma.itineraryItem.createMany({ data: [
    { stopId: trip1Stops[0].id, activityId: tokyoActivities[0]?.id, customTitle: 'Shibuya Crossing & Harajuku', date: d(now,-3), startTime: new Date('1970-01-01T10:00'), endTime: new Date('1970-01-01T13:00'), cost: 0, orderIndex: 0 },
    { stopId: trip1Stops[0].id, customTitle: 'Lunch at Ichiran Ramen', date: d(now,-3), startTime: new Date('1970-01-01T13:30'), endTime: new Date('1970-01-01T14:30'), cost: 15, orderIndex: 1, sectionType: 'food' },
    { stopId: trip1Stops[0].id, activityId: tokyoActivities[2]?.id, customTitle: 'teamLab Borderless', date: d(now,-3), startTime: new Date('1970-01-01T15:00'), endTime: new Date('1970-01-01T18:00'), cost: 30, orderIndex: 2 },
    { stopId: trip1Stops[0].id, customTitle: 'Golden Gai Bar Hopping', date: d(now,-3), startTime: new Date('1970-01-01T20:00'), endTime: new Date('1970-01-01T23:00'), cost: 50, orderIndex: 3 },
    { stopId: trip1Stops[0].id, customTitle: 'Tsukiji Outer Market Breakfast', date: d(now,-2), startTime: new Date('1970-01-01T07:00'), endTime: new Date('1970-01-01T09:00'), cost: 25, orderIndex: 0, sectionType: 'food' },
    { stopId: trip1Stops[0].id, activityId: tokyoActivities[1]?.id, customTitle: 'Senso-ji Temple & Asakusa', date: d(now,-2), startTime: new Date('1970-01-01T10:00'), endTime: new Date('1970-01-01T13:00'), cost: 0, orderIndex: 1 },
    { stopId: trip1Stops[0].id, customTitle: 'Akihabara Electronics & Anime', date: d(now,-2), startTime: new Date('1970-01-01T14:00'), endTime: new Date('1970-01-01T17:00'), cost: 100, orderIndex: 2 },
    { stopId: trip1Stops[0].id, customTitle: 'Day trip to Mt. Fuji', date: d(now,-1), startTime: new Date('1970-01-01T06:00'), endTime: new Date('1970-01-01T18:00'), cost: 80, orderIndex: 0, sectionType: 'transit' },
  ]});

  // Itinerary items for Bali trip
  await prisma.itineraryItem.createMany({ data: [
    { stopId: trip2Stops[0].id, customTitle: 'Arrival & Check-in', date: d(now,-60), startTime: new Date('1970-01-01T14:00'), endTime: new Date('1970-01-01T16:00'), cost: 0, orderIndex: 0, sectionType: 'accommodation' },
    { stopId: trip2Stops[0].id, customTitle: 'Sunset at Tanah Lot', date: d(now,-60), startTime: new Date('1970-01-01T17:00'), endTime: new Date('1970-01-01T19:00'), cost: 10, orderIndex: 1 },
    { stopId: trip2Stops[0].id, activityId: baliActivities[3]?.id, customTitle: 'Balinese Cooking Class', date: d(now,-59), startTime: new Date('1970-01-01T09:00'), endTime: new Date('1970-01-01T13:00'), cost: 45, orderIndex: 0 },
    { stopId: trip2Stops[0].id, customTitle: 'Tegallalang Rice Terraces', date: d(now,-59), startTime: new Date('1970-01-01T15:00'), endTime: new Date('1970-01-01T17:00'), cost: 5, orderIndex: 1 },
    { stopId: trip2Stops[0].id, customTitle: 'Sunrise trek Mt. Batur', date: d(now,-58), startTime: new Date('1970-01-01T02:00'), endTime: new Date('1970-01-01T09:00'), cost: 60, orderIndex: 0, sectionType: 'activity' },
    { stopId: trip2Stops[0].id, customTitle: 'Spa afternoon', date: d(now,-58), startTime: new Date('1970-01-01T14:00'), endTime: new Date('1970-01-01T17:00'), cost: 40, orderIndex: 1 },
    { stopId: trip2Stops[0].id, activityId: baliActivities[4]?.id, customTitle: 'Surfing lesson', date: d(now,-57), startTime: new Date('1970-01-01T08:00'), endTime: new Date('1970-01-01T11:00'), cost: 35, orderIndex: 0 },
    { stopId: trip2Stops[0].id, customTitle: 'Uluwatu Temple & Kecak Dance', date: d(now,-56), startTime: new Date('1970-01-01T16:00'), endTime: new Date('1970-01-01T20:00'), cost: 25, orderIndex: 0 },
  ]});

  // Itinerary items for Singapore trip
  await prisma.itineraryItem.createMany({ data: [
    { stopId: trip5Stops[0].id, customTitle: 'Hawker Center Tour', date: d(now,-30), startTime: new Date('1970-01-01T11:00'), endTime: new Date('1970-01-01T14:00'), cost: 20, orderIndex: 0, sectionType: 'food' },
    { stopId: trip5Stops[0].id, customTitle: 'Gardens by the Bay', date: d(now,-30), startTime: new Date('1970-01-01T16:00'), endTime: new Date('1970-01-01T20:00'), cost: 35, orderIndex: 1 },
    { stopId: trip5Stops[0].id, activityId: singaporeActivities[1]?.id, customTitle: 'Chinatown Food Tour', date: d(now,-29), startTime: new Date('1970-01-01T10:00'), endTime: new Date('1970-01-01T13:00'), cost: 55, orderIndex: 0 },
    { stopId: trip5Stops[0].id, customTitle: 'Marina Bay Sands', date: d(now,-29), startTime: new Date('1970-01-01T18:00'), endTime: new Date('1970-01-01T22:00'), cost: 25, orderIndex: 1 },
    { stopId: trip5Stops[0].id, customTitle: 'Little India breakfast', date: d(now,-28), startTime: new Date('1970-01-01T08:00'), endTime: new Date('1970-01-01T10:00'), cost: 10, orderIndex: 0, sectionType: 'food' },
    { stopId: trip5Stops[0].id, customTitle: 'Sentosa Island', date: d(now,-28), startTime: new Date('1970-01-01T12:00'), endTime: new Date('1970-01-01T18:00'), cost: 50, orderIndex: 1 },
  ]});

  // Itinerary items for Kyoto trip
  await prisma.itineraryItem.createMany({ data: [
    { stopId: trip6Stops[0].id, customTitle: 'Fushimi Inari (early morning)', date: d(now,-10), startTime: new Date('1970-01-01T06:00'), endTime: new Date('1970-01-01T09:00'), cost: 0, orderIndex: 0 },
    { stopId: trip6Stops[0].id, activityId: kyotoActivities[0]?.id, customTitle: 'Gion Walking Tour', date: d(now,-10), startTime: new Date('1970-01-01T14:00'), endTime: new Date('1970-01-01T17:00'), cost: 40, orderIndex: 1 },
    { stopId: trip6Stops[0].id, customTitle: 'Arashiyama Bamboo Grove', date: d(now,-9), startTime: new Date('1970-01-01T07:00'), endTime: new Date('1970-01-01T10:00'), cost: 0, orderIndex: 0 },
    { stopId: trip6Stops[0].id, customTitle: 'Kinkaku-ji (Golden Pavilion)', date: d(now,-9), startTime: new Date('1970-01-01T11:00'), endTime: new Date('1970-01-01T13:00'), cost: 5, orderIndex: 1 },
    { stopId: trip6Stops[0].id, customTitle: 'Traditional Tea Ceremony', date: d(now,-9), startTime: new Date('1970-01-01T15:00'), endTime: new Date('1970-01-01T16:30'), cost: 30, orderIndex: 2 },
    { stopId: trip6Stops[0].id, customTitle: 'Nishiki Market Food Tour', date: d(now,-8), startTime: new Date('1970-01-01T10:00'), endTime: new Date('1970-01-01T13:00'), cost: 25, orderIndex: 0, sectionType: 'food' },
    { stopId: trip6Stops[0].id, customTitle: 'Kiyomizu-dera Temple', date: d(now,-8), startTime: new Date('1970-01-01T15:00'), endTime: new Date('1970-01-01T17:00'), cost: 4, orderIndex: 1 },
  ]});

  console.log('Created itinerary items for 4 trips');

  // Expenses - expanded
  await prisma.expense.createMany({ data:[
    // Bali trip expenses
    { tripId:trip2.id, category:'flight', description:'Round trip flights', amount:800, currency:'USD', date:d(now,-60) },
    { tripId:trip2.id, category:'hotel', description:'Beach villa 10 nights', amount:600, currency:'USD', date:d(now,-60) },
    { tripId:trip2.id, category:'food', description:'Local restaurants', amount:250, currency:'USD', date:d(now,-58) },
    { tripId:trip2.id, category:'activity', description:'Surf lessons', amount:80, currency:'USD', date:d(now,-55) },
    { tripId:trip2.id, category:'transport', description:'Scooter rental', amount:70, currency:'USD', date:d(now,-59) },
    { tripId:trip2.id, category:'activity', description:'Mt. Batur sunrise trek', amount:60, currency:'USD', date:d(now,-58) },
    { tripId:trip2.id, category:'activity', description:'Spa day', amount:40, currency:'USD', date:d(now,-57) },
    { tripId:trip2.id, category:'shopping', description:'Souvenirs & crafts', amount:120, currency:'USD', date:d(now,-52) },
    // Tokyo trip expenses
    { tripId:trip1.id, category:'flight', description:'Round trip to Tokyo', amount:1200, currency:'USD', date:d(now,-3) },
    { tripId:trip1.id, category:'hotel', description:'Shinjuku hotel', amount:500, currency:'USD', date:d(now,-3) },
    { tripId:trip1.id, category:'food', description:'Ramen, sushi, izakaya', amount:150, currency:'JPY', date:d(now,-2) },
    { tripId:trip1.id, category:'transport', description:'JR Pass 7 days', amount:280, currency:'USD', date:d(now,-3) },
    { tripId:trip1.id, category:'activity', description:'teamLab Borderless', amount:30, currency:'USD', date:d(now,-3) },
    { tripId:trip1.id, category:'shopping', description:'Electronics Akihabara', amount:200, currency:'USD', date:d(now,-2) },
    // Singapore trip expenses
    { tripId:trip5.id, category:'flight', description:'Round trip flights', amount:450, currency:'USD', date:d(now,-30) },
    { tripId:trip5.id, category:'hotel', description:'Marina Bay hotel', amount:400, currency:'SGD', date:d(now,-30) },
    { tripId:trip5.id, category:'food', description:'Hawker centers & restaurants', amount:180, currency:'SGD', date:d(now,-29) },
    { tripId:trip5.id, category:'activity', description:'Gardens by the Bay', amount:35, currency:'SGD', date:d(now,-30) },
    { tripId:trip5.id, category:'transport', description:'MRT & Grab rides', amount:50, currency:'SGD', date:d(now,-28) },
    // Kyoto trip expenses
    { tripId:trip6.id, category:'transport', description:'Shinkansen from Tokyo', amount:130, currency:'USD', date:d(now,-10) },
    { tripId:trip6.id, category:'hotel', description:'Traditional ryokan', amount:350, currency:'USD', date:d(now,-10) },
    { tripId:trip6.id, category:'food', description:'Kaiseki dinner', amount:80, currency:'USD', date:d(now,-9) },
    { tripId:trip6.id, category:'activity', description:'Tea ceremony', amount:30, currency:'USD', date:d(now,-9) },
  ]});
  console.log('Added 24 expenses');

  // Trip collaborators
  await prisma.tripCollaborator.createMany({ data: [
    { tripId: trip3.id, userId: user1.id, role: 'editor', acceptedAt: d(now, -1) },
    { tripId: trip3.id, userId: user2.id, role: 'viewer', acceptedAt: d(now, -2) },
    { tripId: trip4.id, userId: user5.id, role: 'editor' },
  ]});
  console.log('Added trip collaborators');

  // Edit history
  await prisma.tripEditHistory.createMany({ data: [
    { tripId: trip3.id, userId: user3.id, action: 'create', field: 'trip', createdAt: d(now, -7) },
    { tripId: trip3.id, userId: user3.id, action: 'update', field: 'description', createdAt: d(now, -5) },
    { tripId: trip3.id, userId: user1.id, action: 'create', field: 'stop', createdAt: d(now, -3) },
    { tripId: trip3.id, userId: user1.id, action: 'update', field: 'budget', createdAt: d(now, -2) },
    { tripId: trip1.id, userId: user1.id, action: 'create', field: 'trip', createdAt: d(now, -5) },
    { tripId: trip1.id, userId: user1.id, action: 'create', field: 'itinerary', createdAt: d(now, -4) },
  ]});
  console.log('Added edit history');

  // Packing items
  const packItems = [
    { tripId:trip1.id, label:'Passport', category:'documents' },
    { tripId:trip1.id, label:'Phone charger', category:'electronics' },
    { tripId:trip1.id, label:'JR Pass', category:'documents' },
    { tripId:trip1.id, label:'Rain jacket', category:'clothing' },
    { tripId:trip1.id, label:'Sunscreen', category:'toiletries' },
    { tripId:trip3.id, label:'Passport', category:'documents' },
    { tripId:trip3.id, label:'EU adapter', category:'electronics' },
    { tripId:trip3.id, label:'Walking shoes', category:'clothing' },
  ];
  await prisma.packingItem.createMany({ data: packItems });
  console.log('Added packing items');

  // Community posts (15+)
  const posts = await Promise.all([
    prisma.communityPost.create({ data:{ userId:user2.id, tripId:trip2.id, content:'Just got back from Bali! The rice terraces in Ubud were absolutely magical. 🌾✨ Highly recommend staying at least 3 days there.', likesCount:24, tags:['bali','ubud','nature'] }}),
    prisma.communityPost.create({ data:{ userId:user1.id, content:'Pro tip: Get a JR Pass before visiting Japan. It saves SO much money on bullet trains! 🚅', likesCount:45, tags:['japan','tips','budget'] }}),
    prisma.communityPost.create({ data:{ userId:user3.id, content:'Planning my European grand tour! Any must-visit restaurants in Paris? 🇫🇷🍷', likesCount:12, tags:['paris','food','europe'] }}),
    prisma.communityPost.create({ data:{ userId:user2.id, content:'Sunset at Tanah Lot temple was the most beautiful thing I\'ve ever seen. No filter needed! 🌅', likesCount:38, tags:['bali','sunset','temple'] }}),
    prisma.communityPost.create({ data:{ userId:user1.id, tripId:trip1.id, content:'Day 2 in Tokyo: Visited Shibuya crossing, Harajuku, and had the BEST ramen in Shinjuku. This city is incredible! 🍜🏙️', likesCount:31, tags:['tokyo','food','japan'] }}),
    prisma.communityPost.create({ data:{ userId:user3.id, content:'Best travel hack: Use Google Translate camera feature to read menus in any language. Game changer! 📱', likesCount:56, tags:['tips','hack','travel'] }}),
    prisma.communityPost.create({ data:{ userId:user2.id, content:'Bali packing essentials: reef-safe sunscreen, mosquito repellent, light rain jacket, and a good book for the beach. 📚🏖️', likesCount:19, tags:['bali','packing','tips'] }}),
    prisma.communityPost.create({ data:{ userId:user1.id, content:'Just discovered this hidden gem in Akihabara - a tiny retro game café with the best matcha latte. 🎮🍵', likesCount:27, tags:['tokyo','hidden-gem','food'] }}),
    prisma.communityPost.create({ data:{ userId:user3.id, content:'Who else thinks Barcelona > Paris? The energy, the food, the architecture... La Sagrada Familia literally made me cry. 😭🏗️', likesCount:42, tags:['barcelona','architecture','debate'] }}),
    prisma.communityPost.create({ data:{ userId:user2.id, content:'One month since Bali and I\'m already planning to go back. The people, the culture, the food... it changes you. 💚', likesCount:33, tags:['bali','reflection','travel'] }}),
    prisma.communityPost.create({ data:{ userId:user1.id, content:'Budget breakdown for 7 days in Tokyo: Flights $1200, Hotel $500, Food $200, Activities $300, Transport $100. Total: ~$2300 for one person.', likesCount:67, tags:['tokyo','budget','breakdown'] }}),
    prisma.communityPost.create({ data:{ userId:user4.id, content:'Just booked my first solo trip to London! Any advice for a first-timer? 🇬🇧', likesCount:18, tags:['london','solo','advice'] }}),
    prisma.communityPost.create({ data:{ userId:user5.id, tripId:trip5.id, content:'Singapore hawker centers are UNREAL. Had the best chicken rice of my life at Maxwell Food Centre for just $4! 🍚', likesCount:52, tags:['singapore','food','budget'] }}),
    prisma.communityPost.create({ data:{ userId:user6.id, tripId:trip6.id, content:'Woke up at 5am to beat the crowds at Fushimi Inari. So worth it - had the torii gates almost to myself! 🏯⛩️', likesCount:71, tags:['kyoto','temples','tips'] }}),
    prisma.communityPost.create({ data:{ userId:user5.id, content:'Hot take: Street food > fancy restaurants every single time. Fight me. 🌮🔥', likesCount:89, tags:['food','debate','streetfood'] }}),
  ]);
  console.log(`Created ${posts.length} community posts`);

  // Comments on posts - expanded
  await prisma.postComment.createMany({ data:[
    { postId:posts[0].id, userId:user1.id, content:'Ubud is amazing! Did you visit the Monkey Forest?' },
    { postId:posts[0].id, userId:user3.id, content:'Adding this to my bucket list!' },
    { postId:posts[0].id, userId:user4.id, content:'How many days would you recommend for Ubud alone?' },
    { postId:posts[1].id, userId:user2.id, content:'Yes! The 7-day JR Pass is the best value.' },
    { postId:posts[1].id, userId:user3.id, content:'How far in advance should you buy it?' },
    { postId:posts[1].id, userId:user6.id, content:'You can only buy it outside Japan! Order before you fly.' },
    { postId:posts[2].id, userId:user1.id, content:'Le Comptoir du Panthéon is incredible and not too touristy.' },
    { postId:posts[2].id, userId:user2.id, content:'Try the croissants at Du Pain et des Idées!' },
    { postId:posts[2].id, userId:user5.id, content:'L\'As du Fallafel in Le Marais is a must!' },
    { postId:posts[4].id, userId:user2.id, content:'Which ramen shop? I need to know!' },
    { postId:posts[4].id, userId:user3.id, content:'Shibuya crossing at night is a whole different vibe.' },
    { postId:posts[5].id, userId:user1.id, content:'Also works for street signs! Saved me so many times.' },
    { postId:posts[8].id, userId:user1.id, content:'Bold take but I respect it 😄' },
    { postId:posts[8].id, userId:user2.id, content:'Barcelona food scene is definitely underrated.' },
    { postId:posts[10].id, userId:user2.id, content:'This is so helpful! Was Tokyo expensive for food?' },
    { postId:posts[10].id, userId:user3.id, content:'Saving this for my planning. Thanks!' },
    { postId:posts[12].id, userId:user1.id, content:'Maxwell is legendary! Also try Lau Pa Sat for satay.' },
    { postId:posts[12].id, userId:user6.id, content:'Singapore hawker centers are UNESCO heritage for a reason!' },
    { postId:posts[13].id, userId:user1.id, content:'This is the way! I made the same mistake of going at noon once...' },
    { postId:posts[14].id, userId:user2.id, content:'100% agree. The best meals are always street food.' },
    { postId:posts[14].id, userId:user3.id, content:'Depends on the country honestly. But for Southeast Asia, absolutely.' },
  ]});
  console.log('Added 21 comments');

  // Saved destinations
  const santorini=cities.find(c=>c.name==='Santorini');
  const seoul=cities.find(c=>c.name==='Seoul'), capetown=cities.find(c=>c.name==='Cape Town');
  const dubai=cities.find(c=>c.name==='Dubai'), lisbon=cities.find(c=>c.name==='Lisbon');
  const prague=cities.find(c=>c.name==='Prague'), marrakech=cities.find(c=>c.name==='Marrakech');
  await prisma.savedDestination.createMany({ data:[
    { userId:user1.id, cityId:bali.id },{ userId:user1.id, cityId:paris.id },{ userId:user1.id, cityId:santorini.id },{ userId:user1.id, cityId:seoul.id },
    { userId:user2.id, cityId:tokyo.id },{ userId:user2.id, cityId:kyoto.id },{ userId:user2.id, cityId:marrakech.id },
    { userId:user3.id, cityId:singapore.id },{ userId:user3.id, cityId:amsterdam.id },{ userId:user3.id, cityId:lisbon.id },
    { userId:user4.id, cityId:dubai.id },{ userId:user4.id, cityId:capetown.id },{ userId:user4.id, cityId:bali.id },
    { userId:user5.id, cityId:tokyo.id },{ userId:user5.id, cityId:barcelona.id },{ userId:user5.id, cityId:rome.id },
    { userId:user6.id, cityId:prague.id },{ userId:user6.id, cityId:amsterdam.id },
  ]});
  console.log('Added 18 saved destinations');

  // Checklist templates
  await prisma.checklistTemplate.createMany({ data:[
    { name:'Beach Vacation', category:'vacation', items: JSON.stringify([
      {label:'Swimsuit',cat:'clothing'},{label:'Sunscreen SPF 50+',cat:'toiletries'},{label:'Flip flops',cat:'clothing'},{label:'Beach towel',cat:'misc'},
      {label:'Sunglasses',cat:'misc'},{label:'Hat',cat:'clothing'},{label:'Waterproof phone pouch',cat:'electronics'},{label:'Aloe vera gel',cat:'toiletries'},
      {label:'Snorkel gear',cat:'misc'},{label:'Light cover-up',cat:'clothing'}
    ])},
    { name:'Business Trip', category:'business', items: JSON.stringify([
      {label:'Laptop + charger',cat:'electronics'},{label:'Business cards',cat:'documents'},{label:'Dress shoes',cat:'clothing'},{label:'Blazer',cat:'clothing'},
      {label:'Presentation materials',cat:'documents'},{label:'Portable WiFi',cat:'electronics'},{label:'Dress shirts',cat:'clothing'},{label:'Tie',cat:'clothing'},
      {label:'Notebook + pen',cat:'misc'},{label:'Breath mints',cat:'toiletries'}
    ])},
    { name:'Backpacking', category:'adventure', items: JSON.stringify([
      {label:'Backpack (40-60L)',cat:'misc'},{label:'Quick-dry towel',cat:'misc'},{label:'Headlamp',cat:'electronics'},{label:'Water bottle',cat:'misc'},
      {label:'First aid kit',cat:'medication'},{label:'Padlock',cat:'misc'},{label:'Dry bags',cat:'misc'},{label:'Hiking boots',cat:'clothing'},
      {label:'Rain poncho',cat:'clothing'},{label:'Multi-tool',cat:'misc'},{label:'Sleeping bag liner',cat:'misc'}
    ])},
    { name:'Winter Trip', category:'seasonal', items: JSON.stringify([
      {label:'Winter coat',cat:'clothing'},{label:'Thermal underwear',cat:'clothing'},{label:'Gloves',cat:'clothing'},{label:'Beanie',cat:'clothing'},
      {label:'Scarf',cat:'clothing'},{label:'Waterproof boots',cat:'clothing'},{label:'Hand warmers',cat:'misc'},{label:'Lip balm',cat:'toiletries'},
      {label:'Moisturizer',cat:'toiletries'},{label:'Wool socks',cat:'clothing'}
    ])},
    { name:'Family Vacation', category:'family', items: JSON.stringify([
      {label:'Kids snacks',cat:'misc'},{label:'Entertainment (tablet/books)',cat:'electronics'},{label:'Car seat (if needed)',cat:'misc'},
      {label:'Baby wipes',cat:'toiletries'},{label:'First aid kit',cat:'medication'},{label:'Comfort toy/blanket',cat:'misc'},
      {label:'Stroller',cat:'misc'},{label:'Swimwear for kids',cat:'clothing'},{label:'Sunscreen (kid-safe)',cat:'toiletries'},
      {label:'Passports for all family',cat:'documents'}
    ])},
  ]});
  console.log('Created checklist templates');

  // Trip notes - expanded
  await prisma.tripNote.createMany({ data:[
    { tripId:trip1.id, title:'Arrival Notes', content:'Arrived at Narita. Got Suica card and took Narita Express to Shinjuku.', noteDate:d(now,-3) },
    { tripId:trip1.id, title:'Best Ramen Spots', content:'1. Fuunji (tsukemen) near Shinjuku\n2. Ichiran Shibuya\n3. Afuri (yuzu shio) in Ebisu', noteDate:d(now,-2) },
    { tripId:trip1.id, title:'Shopping List', content:'- Japanese Kit-Kats\n- Uniqlo basics\n- Nintendo store merch\n- Skincare from Don Quijote', noteDate:d(now,-1) },
    { tripId:trip2.id, title:'Bali Highlights', content:'Top moments:\n- Sunrise at Mount Batur\n- Tegallalang Rice Terrace\n- Uluwatu sunset\n- Cooking class in Ubud', noteDate:d(now,-55) },
    { tripId:trip2.id, title:'Restaurant Recommendations', content:'Warung Babi Guling Ibu Oka - best suckling pig!\nLocavore - fine dining with local ingredients\nMilk & Madu - brunch spot in Canggu', noteDate:d(now,-54) },
    { tripId:trip5.id, title:'Must-eat in Singapore', content:'- Hainanese Chicken Rice at Tian Tian\n- Chili Crab at Jumbo Seafood\n- Laksa at 328 Katong\n- Kaya Toast at Ya Kun', noteDate:d(now,-29) },
    { tripId:trip6.id, title:'Temple Tips', content:'Visit Fushimi Inari EARLY (5-6am) to avoid crowds.\nKinkaku-ji is best in morning light.\nRent a bike to explore Arashiyama area.', noteDate:d(now,-9) },
    { tripId:trip3.id, title:'Pre-trip Research', content:'Need to book:\n- Eiffel Tower tickets (2 weeks ahead)\n- Sagrada Familia (1 month ahead)\n- Vatican Museum (skip the line!)', noteDate:d(now,-1) },
  ]});
  console.log('Added 8 trip notes');

  console.log('Seeding completed! ✅');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
