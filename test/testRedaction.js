#!/usr/bin/env node

import { HealthcareRedactionEngine } from '../dist/utils/redactionEngine.js';

async function testRedactionEngine() {
  console.log('🏥 Testing Healthcare Redaction Engine...\n');
  
  const engine = new HealthcareRedactionEngine();
  
  // Test data samples
  const testCases = [
    {
      name: 'Basic PHI Text',
      data: 'Patient John Doe, SSN: 123-45-6789, phone (555) 123-4567, born 01/15/1980'
    },
    {
      name: 'Healthcare IDs',
      data: 'MRN: 12345678, Insurance ID: ABC123456789, DEA: AB1234567'
    },
    {
      name: 'JSON Patient Record',
      data: JSON.stringify({
        patient: {
          name: 'Jane Smith',
          ssn: '987-65-4321',
          mrn: 'MRN789012',
          phone: '(555) 987-6543',
          email: 'jane.smith@email.com'
        }
      })
    }
  ];

  for (const testCase of testCases) {
    console.log(`📋 Test: ${testCase.name}`);
    console.log(`📝 Original: ${testCase.data}`);
    
    try {
      const result = await engine.redactData(testCase.data);
      console.log(`🔒 Redacted: ${result.redacted}`);
      console.log(`🎯 PHI Detected: ${result.matches.length} items`);
      console.log(`📊 Categories: ${[...new Set(result.matches.map(m => m.category))].join(', ')}\n`);
    } catch (error) {
      console.error(`❌ Error: ${error.message}\n`);
    }
  }

  // Test encryption
  console.log('🔐 Testing Encryption...');
  const key = engine.generateEncryptionKey();
  console.log(`🔑 Generated Key: ${key}`);
  console.log(`✅ Key Valid: ${engine.validateEncryptionKey(key)}\n`);

  // Test encrypted redaction
  const sensitiveData = 'Patient John Doe, SSN: 123-45-6789';
  const encryptedResult = await engine.redactData(sensitiveData, { encryptionKey: key });
  console.log(`🔒 Encrypted Result: ${encryptedResult.encrypted ? 'Yes' : 'No'}`);
  console.log(`📦 Encrypted Data: ${encryptedResult.redacted.substring(0, 50)}...\n`);

  console.log('✅ All tests completed!');
}

testRedactionEngine().catch(console.error);