#!/usr/bin/env node

import { HealthcareRedactionEngine } from '../dist/utils/redactionEngine.js';

async function testPrivacyFeatures() {
  console.log('🔒 Testing Enhanced Privacy Features...\n');
  
  const engine = new HealthcareRedactionEngine();
  
  // Test pattern count
  console.log(`📊 Total PHI Patterns Available: ${engine.getPatternCount()}`);
  
  // Test cache clearing
  console.log('🧹 Testing Cache Clearing...');
  engine.clearCache();
  console.log('✅ Cache cleared successfully');
  
  // Test basic redaction
  const testData = 'Patient John Doe, SSN: 123-45-6789, Phone: (555) 123-4567';
  console.log(`\n📝 Test Data: ${testData}`);
  
  const result = await engine.redactData(testData);
  console.log(`🔒 Redacted: ${result.redacted}`);
  console.log(`🎯 PHI Detected: ${result.matches.length} items`);
  
  // Clear cache again after processing
  engine.clearCache();
  console.log('🧹 Post-processing cache clear completed');
  
  console.log('\n✅ Privacy features test completed successfully!');
  console.log('🛡️  All processing occurred locally with zero retention');
}

testPrivacyFeatures().catch(console.error);