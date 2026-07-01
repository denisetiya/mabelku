import { db, schema } from './index';
import { hashPassword } from '../auth';
import { generateId } from '../slug';
import { serializeImages } from '../product';

async function seed() {
  console.log('Seeding database...');

  const existingAdmin = db.select().from(schema.adminUsers).get();
  if (!existingAdmin) {
    const passwordHash = await hashPassword('admin123');
    db.insert(schema.adminUsers)
      .values({
        id: generateId(),
        name: 'Admin MebelKu',
        email: 'admin@mebelku.com',
        passwordHash,
        role: 'admin',
      })
      .run();
    console.log('Admin user created: admin@mebelku.com / admin123');
  }

  const existingSettings = db.select().from(schema.storeSettings).get();
  if (!existingSettings) {
    db.insert(schema.storeSettings)
      .values({
        id: generateId(),
        storeName: 'MebelKu',
        whatsappNumber: '628123456789',
        email: 'halo@mebelku.com',
        address: 'Jl. Mebel Indah No. 45, Jepara, Jawa Tengah',
        openingHours: 'Senin-Sabtu, 08:00-17:00 WIB',
        bankAccount: 'BCA 1234567890 a.n. MebelKu / Mandiri 0987654321 a.n. MebelKu',
        heroTitle: 'Mebel Berkualitas untuk Rumah Impian Anda',
        heroSubtitle: 'Koleksi mebel premium dari kayu pilihan, dibuat dengan pengerjaan teliti oleh pengrajin berpengalaman di Jepara.',
        instagramUrl: 'https://instagram.com/mebelku',
        facebookUrl: 'https://facebook.com/mebelku',
        tiktokUrl: 'https://tiktok.com/@mebelku',
        aboutText: 'MebelKu adalah toko mebel yang menyediakan berbagai produk furniture berkualitas tinggi. Berlokasi di Jepara, pusat mebel Indonesia, kami berkomitmen menghadirkan mebel terbaik dengan bahan pilihan dan pengerjaan teliti oleh pengrajin berpengalaman. Setiap produk kami dibuat dengan standar kualitas yang tinggi untuk memastikan kepuasan pelanggan.',
      })
      .run();
    console.log('Store settings created');
  }

  const existingCategories = db.select().from(schema.categories).all();
  if (existingCategories.length === 0) {
    const categoryData = [
      { name: 'Kursi', description: 'Berbagai jenis kursi kayu berkualitas' },
      { name: 'Meja', description: 'Meja makan, meja kopi, meja kerja' },
      { name: 'Lemari', description: 'Lemari pakaian, lemari penyimpanan' },
      { name: 'Sofa', description: 'Sofa ruang tamu yang nyaman' },
      { name: 'Rak', description: 'Rak buku, rak sepatu, rak display' },
      { name: 'Tempat Tidur', description: 'Tempat tidur kayu minimalis dan klasik' },
      { name: 'Kitchen Set', description: 'Kitchen set custom sesuai kebutuhan' },
      { name: 'Dekorasi Interior', description: 'Aksesoris dekorasi rumah' },
    ];

    for (const cat of categoryData) {
      const slug = cat.name.toLowerCase().replace(/\s+/g, '-');
      db.insert(schema.categories)
        .values({
          id: generateId(),
          name: cat.name,
          slug,
          description: cat.description,
          isActive: true,
        })
        .run();
    }
    console.log(`${categoryData.length} categories created`);
  }

  const existingProducts = db.select().from(schema.products).all();
  if (existingProducts.length === 0) {
    const categories = db.select().from(schema.categories).all();
    const catMap = Object.fromEntries(categories.map((c) => [c.name, c.id]));

    const products = [
      {
        name: 'Kursi Kayu Jati Minimalis',
        category: 'Kursi',
        price: 850000,
        discountPrice: 750000,
        stock: 15,
        sku: 'KRS-JT-001',
        shortDescription: 'Kursi kayu jati solid dengan desain minimalis modern',
        description: 'Kursi kayu jati minimalis ini dibuat dari kayu jati pilihan yang sudah dikeringkan dengan sempurna. Desainnya yang simpel dan elegan cocok untuk ruang makan maupun teras rumah Anda. Finishing menggunakan cat yang aman dan tahan lama.',
        material: 'Kayu Jati',
        color: 'Natural Brown',
        dimension: '45 x 45 x 90 cm',
        weight: 8,
        isFeatured: true,
      },
      {
        name: 'Meja Makan 6 Kursi Kayu Jati',
        category: 'Meja',
        price: 4500000,
        discountPrice: null,
        stock: 5,
        sku: 'MJA-MK-001',
        shortDescription: 'Meja makan kapasitas 6 orang dari kayu jati solid',
        description: 'Meja makan mewah dari kayu jati solid dengan kapasitas 6 orang. Permukaan meja yang halus dan kokoh membuatnya tahan digunakan dalam jangka waktu lama. Cocok untuk ruang makan keluarga Anda.',
        material: 'Kayu Jati',
        color: 'Dark Brown',
        dimension: '180 x 90 x 75 cm',
        weight: 45,
        isFeatured: true,
      },
      {
        name: 'Lemari Pakaian 4 Pintu Sliding',
        category: 'Lemari',
        price: 3200000,
        discountPrice: 2800000,
        stock: 8,
        sku: 'LMR-PK-001',
        shortDescription: 'Lemari pakaian 4 pintu sliding dengan kaca cermin',
        description: 'Lemari pakaian modern dengan sistem pintu sliding yang hemat ruang. Dilengkapi kaca cermin full dan ruang penyimpanan yang luas. Interior lemari dilengkapi gantungan baju dan rak serbaguna.',
        material: 'MDF + finishing kayu',
        color: 'White Oak',
        dimension: '200 x 60 x 210 cm',
        weight: 80,
        isFeatured: true,
      },
      {
        name: 'Sofa Ruang Tamu L Shape Premium',
        category: 'Sofa',
        price: 5500000,
        discountPrice: 4800000,
        stock: 3,
        sku: 'SFA-RT-001',
        shortDescription: 'Sofa L shape dengan busa premium dan bahan katun linen',
        description: 'Sofa ruang tamu L shape dengan desain modern dan nyaman. Menggunakan busa premium yang empuk namun tetap padat. Bahan cover katun linen yang mudah dibersihkan dan tahan lama. Cocok untuk ruang tamu minimalis modern.',
        material: 'Baja, Busa Premium, Katun Linen',
        color: 'Grey',
        dimension: '240 x 160 x 85 cm',
        weight: 60,
        isFeatured: true,
      },
      {
        name: 'Rak Buku 5 Susun Minimalis',
        category: 'Rak',
        price: 650000,
        discountPrice: null,
        stock: 12,
        sku: 'RAK-BK-001',
        shortDescription: 'Rak buku 5 susun kayu mahoni minimalis',
        description: 'Rak buku 5 susun dengan desain minimalis yang cocok untuk ruang kerja atau kamar anak. Dibuat dari kayu mahoni pilihan dengan finishing halus. Kokoh dan stabil untuk menampung berbagai ukuran buku.',
        material: 'Kayu Mahoni',
        color: 'Natural',
        dimension: '80 x 30 x 150 cm',
        weight: 15,
        isFeatured: false,
      },
      {
        name: 'Tempat Tidur Kayu Jati King Size',
        category: 'Tempat Tidur',
        price: 6500000,
        discountPrice: null,
        stock: 4,
        sku: 'TPT-TD-001',
        shortDescription: 'Tempat tidur king size kayu jati solid dengan headboard',
        description: 'Tempat tidur mewah king size (180x200) dari kayu jati solid. Dilengkapi headboard elegan yang memberikan sentuhan klasik pada kamar tidur Anda. Pengerjaan teliti dengan sistem sambungan yang kokoh.',
        material: 'Kayu Jati',
        color: 'Natural Brown',
        dimension: '200 x 180 x 120 cm',
        weight: 90,
        isFeatured: true,
      },
      {
        name: 'Meja Kerja Minimalis Standing Desk',
        category: 'Meja',
        price: 1200000,
        discountPrice: 950000,
        stock: 10,
        sku: 'MJA-KR-001',
        shortDescription: 'Meja kerja standing desk adjustable height',
        description: 'Meja kerja modern dengan fitur adjustable height yang bisa diatur sesuai kebutuhan. Permukaan meja dari kayu berkualitas dengan kaki besi kokoh. Cocok untuk work from home.',
        material: 'Kayu + Besi',
        color: 'Black + Natural Wood',
        dimension: '120 x 60 x 75-115 cm',
        weight: 25,
        isFeatured: false,
      },
      {
        name: 'Kursi Santai Rotan Anyaman',
        category: 'Kursi',
        price: 550000,
        discountPrice: null,
        stock: 20,
        sku: 'KRS-RT-001',
        shortDescription: 'Kursi santai anyaman rotan natural untuk bersantai',
        description: 'Kursi santai dari anyaman rotan pilihan dengan bantalan empuk. Desain klasik yang memberikan nuansa hangat di ruangan Anda. Cocok untuk teras, taman, atau ruang keluarga.',
        material: 'Rotan, Bantalan Katun',
        color: 'Natural Rattan',
        dimension: '70 x 80 x 95 cm',
        weight: 6,
        isFeatured: false,
      },
      {
        name: 'Kitchen Set HPL Minimalis 3 Meter',
        category: 'Kitchen Set',
        price: 8500000,
        discountPrice: null,
        stock: 2,
        sku: 'KCH-ST-001',
        shortDescription: 'Kitchen set custom 3 meter dengan finishing HPL',
        description: 'Kitchen set custom 3 meter dengan finishing HPL premium. Dilengkapi countertop granit, sink stainless steel, dan rak penyimpanan lengkap. Desain mengikuti layout dapur Anda. Pemasangan termasuk.',
        material: 'Multiplek + HPL + Granit',
        color: 'White Grey',
        dimension: '300 x 60 x 85 cm',
        weight: 150,
        isFeatured: false,
      },
      {
        name: 'Cermin Hias Dinding Kayu Jati',
        category: 'Dekorasi Interior',
        price: 350000,
        discountPrice: 250000,
        stock: 25,
        sku: 'DKR-CR-001',
        shortDescription: 'Cermin hias dinding dengan frame kayu jati ukir',
        description: 'Cermin hias dinding dengan frame kayu jati berukir halus. Memberikan sentuhan elegan pada ruangan. Cocok untuk ruang tamu, kamar tidur, atau koridor. Tersedia dalam berbagai ukuran.',
        material: 'Kayu Jati + Cermin',
        color: 'Dark Brown',
        dimension: '60 x 90 cm',
        weight: 5,
        isFeatured: false,
      },
      {
        name: 'Sofa Tunggal Accent Chair Velvet',
        category: 'Sofa',
        price: 1800000,
        discountPrice: null,
        stock: 7,
        sku: 'SFA-TG-001',
        shortDescription: 'Sofa tunggal accent chair dengan bahan velvet mewah',
        description: 'Sofa tunggal accent chair dengan bahan velvet yang mewah dan lembut. Desain modern dengan kaki emas yang elegan. Sempurna untuk menambah accent di ruang tamu atau kamar tidur Anda.',
        material: 'Baja, Velvet, Busa',
        color: 'Emerald Green',
        dimension: '75 x 80 x 80 cm',
        weight: 18,
        isFeatured: false,
      },
      {
        name: 'Lemari Sepatu 3 Susun Modern',
        category: 'Lemari',
        price: 750000,
        discountPrice: null,
        stock: 0,
        sku: 'LMR-PT-001',
        shortDescription: 'Lemari sepatu 3 susun dengan ventilasi udara',
        description: 'Lemari sepatu 3 susun kapasitas 12-15 pasang sepatu. Dilengkapi ventilasi udara untuk sirkulasi yang baik. Desain slim yang hemat ruang, cocok untuk diletakkan di dekat pintu masuk.',
        material: 'MDF',
        color: 'White',
        dimension: '80 x 30 x 110 cm',
        weight: 20,
        isFeatured: false,
      },
    ];

    for (const p of products) {
      const slug = p.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      db.insert(schema.products)
        .values({
          id: generateId(),
          name: p.name,
          slug,
          sku: p.sku,
          shortDescription: p.shortDescription,
          description: p.description,
          price: p.price,
          discountPrice: p.discountPrice,
          stock: p.stock,
          material: p.material,
          color: p.color,
          dimension: p.dimension,
          weight: p.weight,
          categoryId: catMap[p.category],
          mainImage: null,
          images: serializeImages([]),
          isFeatured: p.isFeatured,
          isActive: true,
        })
        .run();
    }
    console.log(`${products.length} products created`);
  }

  console.log('Seed completed successfully!');
  console.log('\nLogin: admin@mebelku.com / admin123');
}

seed().catch(console.error);
