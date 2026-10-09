import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import '../src/config/env.js';
import { toSlug } from '../src/lib/slug.js';

const prisma = new PrismaClient();
const isProd = process.env.NODE_ENV === 'production';

// The 8 customer-facing categories (order = display order).
const CATEGORIES = [
  { name: 'Switches & Sockets', icon: 'ToggleRight', description: 'Modular switches, switch sockets, plates, covers and regulators for homes, shops and offices.' },
  { name: 'Lighting', icon: 'Lightbulb', description: 'LED bulbs, panel lights, downlights, spotlights, wall, ceiling and decorative lights.' },
  { name: 'Wires & Cables', icon: 'Cable', description: 'House wiring, flexible, multi-core and armoured cables in every common size.' },
  { name: 'Circuit Protection', icon: 'ShieldCheck', description: 'MCBs, RCCBs, isolators and surge protection for safe installations.' },
  { name: 'Electrical Accessories', icon: 'Plug', description: 'Plugs, holders, junction boxes, conduits, glands, lugs and fittings.' },
  { name: 'Electrical Tools', icon: 'Wrench', description: 'Testers, multimeters, strippers, crimpers and installation tools.' },
  { name: 'Distribution & Control', icon: 'CircuitBoard', description: 'Distribution boards, changeovers, contactors and control gear.' },
  { name: 'Other Electrical Products', icon: 'Boxes', description: 'Everything else for your electrical project. Ask us if you can’t find it.' },
];

// [category, name, unit, summary, specs, featured, model]
const PRODUCTS = [
  ['Switches & Sockets', '6A 1-Way Modular Switch', 'piece', 'Smooth-action modular switch with flame-retardant polycarbonate body.', [['Rating', '6A, 240V'], ['Type', '1-way'], ['Module', '1M']], true, '6A 1-Way, 1M'],
  ['Switches & Sockets', '16A Switch Socket Combined', 'piece', 'Heavy-duty switch socket for ACs, geysers and kitchen appliances.', [['Rating', '16A, 240V'], ['Pins', '3-pin']], true, '16A, 3-pin'],
  ['Switches & Sockets', '8-Module Switch Plate (White)', 'piece', 'Scratch-resistant cover plate with mounting frame.', [['Modules', '8M'], ['Finish', 'Glossy white']], false, '8M plate'],
  ['Wires & Cables', '1.5 sq mm FR PVC House Wire', 'coil', 'Flame-retardant copper house wire for lighting circuits.', [['Size', '1.5 sq mm'], ['Length', '90 m'], ['Conductor', 'Copper']], true, '1.5 sq mm × 90 m'],
  ['Wires & Cables', '2.5 sq mm FR PVC House Wire', 'coil', 'Copper house wire for power and socket circuits.', [['Size', '2.5 sq mm'], ['Length', '90 m']], false, '2.5 sq mm × 90 m'],
  ['Wires & Cables', '4 Core 6 sq mm Armoured Cable', 'metre', 'Steel-wire armoured cable for sub-mains and outdoor runs.', [['Cores', '4'], ['Size', '6 sq mm']], false, '4C × 6 sq mm'],
  ['Lighting', '9W LED Bulb B22 Cool Day Light', 'piece', 'Bright 6500K LED bulb with 2-year warranty.', [['Wattage', '9W'], ['Base', 'B22'], ['Colour', '6500K']], true, '9W B22 6500K'],
  ['Lighting', '12W LED Bulb E27 Warm White', 'piece', 'Warm 3000K bulb for living rooms and bedrooms.', [['Wattage', '12W'], ['Base', 'E27']], false, '12W E27 3000K'],
  ['Lighting', '18W Round LED Panel Light', 'piece', 'Slim recessed panel for false ceilings.', [['Wattage', '18W'], ['Cut-out', '205 mm']], true, '18W round, recessed'],
  ['Lighting', '7W COB Spotlight', 'piece', 'Focused COB spotlight for shops and display areas.', [['Wattage', '7W'], ['Beam', '36°']], false, '7W COB 36°'],
  ['Lighting', 'Up-Down Wall Light (Outdoor)', 'piece', 'IP65 aluminium wall light for facades and gates.', [['IP rating', 'IP65'], ['Finish', 'Matte black']], true, 'IP65 up-down'],
  ['Lighting', 'Modern Ring Ceiling Light 36W', 'piece', 'Contemporary LED ring fixture for living spaces.', [['Wattage', '36W'], ['Diameter', '600 mm']], false, '36W, Ø600 mm'],
  ['Circuit Protection', '32A Single Pole MCB (C-Curve)', 'piece', 'Miniature circuit breaker for overload and short-circuit protection.', [['Rating', '32A'], ['Poles', 'SP'], ['Curve', 'C']], true, '32A SP C-curve'],
  ['Circuit Protection', '40A 30mA Double Pole RCCB', 'piece', 'Residual current protection against earth leakage and shock.', [['Rating', '40A'], ['Sensitivity', '30mA'], ['Poles', 'DP']], false, '40A 30mA DP'],
  ['Distribution & Control', '8-Way SPN Distribution Board', 'piece', 'Double-door powder-coated DB with neutral and earth bars.', [['Ways', '8'], ['Type', 'SPN']], false, '8-way SPN'],
  ['Electrical Accessories', '16A 3-Pin Plug Top', 'piece', 'Heavy-duty plug top with brass pins.', [['Rating', '16A']], false, '16A 3-pin'],
  ['Electrical Accessories', 'B22 Batten Lamp Holder', 'piece', 'Bakelite batten holder for B22 bulbs.', [['Base', 'B22']], false, 'B22 batten'],
  ['Electrical Tools', 'Digital Multimeter', 'piece', 'Auto-ranging multimeter for voltage, current and continuity.', [['CAT rating', 'CAT III 600V']], false, 'CAT III 600V'],
  ['Electrical Tools', 'Insulated Wire Stripper', 'piece', 'Adjustable stripper and cutter, 1000V insulated handles.', [['Insulation', '1000V']], false, '1000V insulated'],
];

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');
  if (isProd && (password.length < 12 || /change-me|password|admin/i.test(password))) {
    throw new Error('Refusing to seed production admin with a weak or placeholder ADMIN_PASSWORD');
  }

  await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN' },
    create: {
      email, name: 'Administrator', role: 'ADMIN', emailVerifiedAt: new Date(),
      passwordHash: await bcrypt.hash(password, 12),
    },
  });
  console.log(`✔ admin ${email}`);
}

async function seedCatalog({ reset }) {
  if (reset) {
    // Dev only: wipe the sample catalogue so the category structure can change.
    if (isProd) throw new Error('--reset-catalog is not allowed in production');
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    console.log('• catalogue reset');
  }

  // Only seed an empty catalogue. This seed runs on every Docker deploy (migrate job), so it
  // must never re-create categories an admin has renamed or deleted.
  if (await prisma.category.count()) return console.log('• catalogue exists, skipping categories and samples');

  const ids = {};
  for (const [i, c] of CATEGORIES.entries()) {
    const slug = toSlug(c.name);
    const row = await prisma.category.create({ data: { ...c, slug, sortOrder: i } });
    ids[c.name] = row.id;
  }
  console.log(`✔ ${CATEGORIES.length} categories`);

  // Real photos and brands are added in admin.
  for (const [category, name, unit, summary, specs, isFeatured, model] of PRODUCTS) {
    await prisma.product.create({
      data: {
        name, slug: toSlug(name), unit, summary, isFeatured, model, categoryId: ids[category],
        description: `<p>${summary}</p>`,
        specs: specs.map(([label, value]) => ({ label, value })),
      },
    });
  }
  console.log(`✔ ${PRODUCTS.length} sample products`);
}

try {
  await seedAdmin();
  if (!isProd || process.argv.includes('--catalog')) await seedCatalog({ reset: process.argv.includes('--reset-catalog') });
} catch (err) {
  console.error(`✘ seed failed: ${err.message}`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
