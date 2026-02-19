// Test scan processor directly
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testScan() {
  try {
    console.log('🔍 Testing scan processor...\n');

    // Get the latest failed scan
    const scan = await prisma.scan.findFirst({
      where: { status: 'FAILED' },
      orderBy: { createdAt: 'desc' },
    });

    if (!scan) {
      console.log('❌ No failed scans found');
      return;
    }

    console.log('📊 Found failed scan:', scan.id);
    console.log('Error:', scan.errorMessage);
    console.log('\n🔄 Attempting to process again...\n');

    // Import and run the processor
    const { processWebsiteScan } = require('./src/lib/jobs/websiteScanProcessor.ts');
    
    try {
      const result = await processWebsiteScan(scan.id);
      console.log('\n✅ SUCCESS! Scan completed');
      console.log('Energy:', result.energy_kWh);
      console.log('Carbon:', result.carbon_kg);
      console.log('AI Report:', result.aiReport ? 'Generated' : 'Not generated');
    } catch (error) {
      console.error('\n❌ Scan failed with error:');
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testScan();
