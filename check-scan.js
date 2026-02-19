// Check latest scan from database
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkLatestScan() {
  try {
    console.log('🔍 Checking latest website scan...\n');

    const latestScan = await prisma.scan.findFirst({
      where: { type: 'WEBSITE' },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestScan) {
      console.log('❌ No scans found in database');
      return;
    }

    console.log('📊 Latest Scan Details:');
    console.log('ID:', latestScan.id);
    console.log('Status:', latestScan.status);
    console.log('Created:', latestScan.createdAt);
    console.log('Updated:', latestScan.updatedAt);
    console.log('\n📝 Input:');
    console.log(JSON.stringify(latestScan.inputJson, null, 2));
    
    if (latestScan.resultJson) {
      console.log('\n✅ Result:');
      const result = latestScan.resultJson;
      console.log('Energy:', result.energy_kWh, 'kWh');
      console.log('Carbon:', result.carbon_kg, 'kg CO2');
      console.log('Page Weight:', result.metrics?.pageWeightKB, 'KB');
      console.log('DOM Nodes:', result.metrics?.domNodes);
      console.log('JS Execution:', result.metrics?.jsExecutionMs, 'ms');
      console.log('Pages Scanned:', result.metrics?.pagesScanned);
      
      if (result.aiReport) {
        console.log('\n🤖 AI Report:');
        console.log('Summary:', result.aiReport.summary?.substring(0, 100) + '...');
        console.log('Has Detailed Analysis:', !!result.aiReport.detailedAnalysis);
      } else {
        console.log('\n⚠️  NO AI REPORT FOUND!');
      }
      
      console.log('\n📋 Recommendations:', result.recommendations?.length || 0);
      if (result.recommendations && result.recommendations.length > 0) {
        result.recommendations.forEach((rec, i) => {
          console.log(`  ${i + 1}. ${rec.title} (${rec.estimatedReductionPercent}% reduction, ${rec.effort} effort)`);
        });
      }
    } else {
      console.log('\n❌ No result data');
    }

    if (latestScan.errorMessage) {
      console.log('\n❌ Error:', latestScan.errorMessage);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLatestScan();
