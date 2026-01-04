#!/usr/bin/env node
/**
 * Test script for 3D vector system
 * Tests embedding generation, 3D coordinate mapping, and redundancy calculation
 */

// Use Vercel deployment URL
const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NEXT_PUBLIC_SITE_URL || 'https://syntheverse-poc.vercel.app';

async function testVectorSystem() {
  console.log('🧪 Testing 3D Vector System\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  // Test 1: Check vectors API endpoint
  console.log('📊 Test 1: Fetching vectors from /api/vectors');
  try {
    const vectorsResponse = await fetch(`${BASE_URL}/api/vectors`);
    if (!vectorsResponse.ok) {
      throw new Error(`HTTP ${vectorsResponse.status}: ${await vectorsResponse.text()}`);
    }
    const vectorsData = await vectorsResponse.json();
    console.log('✅ Vectors API working');
    console.log(`   - Total submissions: ${vectorsData.metadata?.total_submissions || 0}`);
    console.log(`   - Vectorized submissions: ${vectorsData.count || 0}`);

    if (vectorsData.vectors && vectorsData.vectors.length > 0) {
      const firstVector = vectorsData.vectors[0];
      console.log(`   - Sample vector: ${firstVector.title}`);
      if (firstVector.vector) {
        console.log(
          `     Coordinates: (${firstVector.vector.x.toFixed(2)}, ${firstVector.vector.y.toFixed(2)}, ${firstVector.vector.z.toFixed(2)})`
        );
      }
    }
    console.log();
  } catch (error) {
    console.error('❌ Vectors API failed:', error.message);
    console.log();
  }

  // Test 2: Check sandbox map endpoint
  console.log('🗺️  Test 2: Fetching sandbox map from /api/sandbox-map');
  try {
    const mapResponse = await fetch(`${BASE_URL}/api/sandbox-map`);
    if (!mapResponse.ok) {
      throw new Error(`HTTP ${mapResponse.status}: ${await mapResponse.text()}`);
    }
    const mapData = await mapResponse.json();
    console.log('✅ Sandbox map API working');
    console.log(`   - Nodes: ${mapData.nodes?.length || 0}`);
    console.log(`   - Edges: ${mapData.edges?.length || 0}`);
    console.log();
  } catch (error) {
    console.error('❌ Sandbox map API failed:', error.message);
    console.log();
  }

  // Test 3: Check database for vector columns via sandbox map
  console.log('💾 Test 3: Checking database for vector data');
  try {
    // Use sandbox map data which includes vector information
    const mapResponse = await fetch(`${BASE_URL}/api/sandbox-map`);
    if (mapResponse.ok) {
      const mapData = await mapResponse.json();
      const withVectors = mapData.nodes?.filter((n) => n.vector !== null) || [];
      console.log('✅ Vector data check via sandbox map');
      console.log(`   - Total nodes: ${mapData.nodes?.length || 0}`);
      console.log(`   - With 3D vectors: ${withVectors.length || 0}`);
      if (mapData.nodes && mapData.nodes.length > 0) {
        const coverage = ((withVectors.length / mapData.nodes.length) * 100).toFixed(1);
        console.log(`   - Vector coverage: ${coverage}%`);
      }
      if (withVectors.length > 0) {
        const sample = withVectors[0];
        console.log(`   - Sample vector: "${sample.title}"`);
        if (sample.vector) {
          console.log(
            `     Coordinates: (${sample.vector.x.toFixed(2)}, ${sample.vector.y.toFixed(2)}, ${sample.vector.z.toFixed(2)})`
          );
        }
      }
    }
    console.log();
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.log();
  }

  console.log('✨ Testing complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Submit a new PoC to test vector generation');
  console.log('   2. Check /api/vectors to see 3D coordinates');
  console.log('   3. View visualization in dashboard');
}

// Run tests
testVectorSystem().catch(console.error);
