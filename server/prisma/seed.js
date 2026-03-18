const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.product.deleteMany();

  const products = [
    {
      name: 'Premium Wireless Headphones',
      price: 129.99,
      category: 'Electronics',
      inStock: true,
      description: 'Immersive sound with active noise cancellation and 30-hour battery life.',
    },
    {
      name: 'Organic Cotton T-Shirt',
      price: 24.99,
      category: 'Clothing',
      inStock: true,
      description: 'Soft, breathable organic cotton tee available in multiple colors.',
    },
    {
      name: 'Ceramic Coffee Mug',
      price: 14.50,
      category: 'Home',
      inStock: false,
      description: 'Handcrafted ceramic mug with a minimalist design. Holds 12oz.',
    },
    {
      name: 'Gaming Mouse',
      price: 49.99,
      category: 'Electronics',
      inStock: true,
      description: 'Ergonomic gaming mouse with 16000 DPI sensor and RGB lighting.',
    },
    {
      name: 'Leather Wallet',
      price: 39.99,
      category: 'Accessories',
      inStock: false,
      description: 'Genuine leather bifold wallet with RFID blocking technology.',
    },
    {
      name: 'Running Shoes',
      price: 89.99,
      category: 'Clothing',
      inStock: true,
      description: 'Lightweight running shoes with responsive cushioning and breathable mesh.',
    },
    {
      name: 'Smart Watch Pro',
      price: 199.99,
      category: 'Electronics',
      inStock: true,
      description: 'Advanced fitness tracking, heart rate monitor, and 5-day battery life.',
    },
    {
      name: 'Bamboo Desk Organizer',
      price: 34.99,
      category: 'Home',
      inStock: true,
      description: 'Eco-friendly bamboo organizer with multiple compartments for a tidy workspace.',
    },
    {
      name: 'Vintage Sunglasses',
      price: 59.99,
      category: 'Accessories',
      inStock: true,
      description: 'Retro-styled UV400 polarized sunglasses with durable acetate frames.',
    },
    {
      name: 'Portable Bluetooth Speaker',
      price: 74.99,
      category: 'Electronics',
      inStock: true,
      description: 'Waterproof Bluetooth speaker with 360° sound and 12-hour playtime.',
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log(`Seeded ${products.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
