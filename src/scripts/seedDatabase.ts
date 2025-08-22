import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://uedobujkjgufdlodhbmd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlZG9idWpramd1ZmRsb2RoYm1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5ODY4NjYsImV4cCI6MjA1NzU2Mjg2Nn0.4hbnC5RcTzillq0oqQg9PBgJbDfguK2tSyg-G0a3zxQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

const experiences = [
  {
    title: 'Traditional Pottery Workshop',
    description: 'Learn the art of traditional pottery making from local artisans. Create your own ceramic pieces using ancient techniques.',
    price: 75,
    duration: 180,
    location: 'Kyoto Cultural Center',
    category: 'Crafts',
    max_participants: 8,
    status: 'approved',
    images: ['https://images.unsplash.com/photo-1565193298357-c816cf5c1d52'],
  },
  {
    title: 'Mount Fuji Sunrise Hike',
    description: 'Experience the breathtaking sunrise from Mount Fuji summit with our expert local guides.',
    price: 120,
    duration: 480,
    location: 'Mount Fuji',
    category: 'Adventure',
    max_participants: 12,
    status: 'approved',
    images: ['https://images.unsplash.com/photo-1490806843957-31f4c9a91c65'],
  },
  {
    title: 'Tea Ceremony Experience',
    description: 'Immerse yourself in the traditional Japanese tea ceremony, guided by a tea master.',
    price: 60,
    duration: 90,
    location: 'Traditional Tea House, Tokyo',
    category: 'Culture',
    max_participants: 6,
    status: 'approved',
    images: ['https://images.unsplash.com/photo-1576091160399-112ba8d25d1d'],
  },
  {
    title: 'Sushi Making Class',
    description: 'Learn to make authentic sushi from a professional chef in a traditional kitchen.',
    price: 90,
    duration: 150,
    location: 'Tsukiji Market Area',
    category: 'Culinary',
    max_participants: 10,
    status: 'pending',
    images: ['https://images.unsplash.com/photo-1579871494447-9811cf80d66c'],
  },
];

const products = [
  {
    title: 'Handcrafted Ceramic Tea Set',
    description: 'Beautiful tea set made by local artisans using traditional techniques.',
    price: 120,
    category: 'Ceramics',
    artisan_name: 'Tanaka Yuki',
    stock: 5,
    images: ['https://images.unsplash.com/photo-1556906851-a0b18229d921'],
  },
  {
    title: 'Traditional Japanese Kimono',
    description: 'Elegant handmade kimono with classic patterns.',
    price: 300,
    category: 'Clothing',
    artisan_name: 'Sato Mei',
    stock: 3,
    images: ['https://images.unsplash.com/photo-1526289034009-0240dada5650'],
  },
  {
    title: 'Bamboo Tea Whisk (Chasen)',
    description: 'Hand-carved bamboo tea whisk for matcha preparation.',
    price: 45,
    category: 'Tea Ceremony',
    artisan_name: 'Yamamoto Hiroshi',
    stock: 10,
    images: ['https://images.unsplash.com/photo-1563822249548-9a72b6353cd1'],
  },
  {
    title: 'Handwoven Bamboo Basket',
    description: 'Traditional bamboo basket perfect for flower arrangement.',
    price: 85,
    category: 'Home Decor',
    artisan_name: 'Suzuki Ken',
    stock: 4,
    images: ['https://images.unsplash.com/photo-1587131782738-de30ea91a542'],
  },
];

// Test experience to verify table structure
const testExperience = {
  title: 'Test Experience',
  description: 'Test description',
  price: 50,
  duration: 60,
  location: 'Test Location',
  category: 'Test',
  max_participants: 5,
  status: 'pending',
  images: ['https://example.com/image.jpg'],
};

async function verifyTableStructure() {
  try {
    console.log('Verifying table structure...');
    
    // Try to insert a single test experience
    const { data, error } = await supabase
      .from('experiences')
      .insert([testExperience])
      .select();
    
    if (error) {
      console.error('Table structure verification failed:', error);
      return false;
    }
    
    console.log('Table structure verified successfully:', data);
    
    // Clean up test data
    if (data && data[0]) {
      await supabase
        .from('experiences')
        .delete()
        .eq('id', data[0].id);
    }
    
    return true;
  } catch (error) {
    console.error('Error during verification:', error);
    return false;
  }
}

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Insert experiences
    const { data: experiencesData, error: experiencesError } = await supabase
      .from('experiences')
      .insert(experiences)
      .select();

    if (experiencesError) throw experiencesError;
    console.log('✓ Experiences added');

    // Insert products
    const { error: productsError } = await supabase
      .from('products')
      .insert(products);

    if (productsError) throw productsError;
    console.log('✓ Products added');

    // Create some mock bookings for the experiences
    if (experiencesData) {
      const bookings = experiencesData.flatMap(experience => ([
        {
          experience_id: experience.id,
          booking_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          num_participants: Math.floor(Math.random() * 4) + 1,
          status: 'confirmed',
        },
        {
          experience_id: experience.id,
          booking_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          num_participants: Math.floor(Math.random() * 4) + 1,
          status: 'pending',
        },
      ]));

      const { error: bookingsError } = await supabase
        .from('bookings')
        .insert(bookings);

      if (bookingsError) throw bookingsError;
      console.log('✓ Bookings added');
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Execute the verification
verifyTableStructure();

// Execute the seeding
seedDatabase();