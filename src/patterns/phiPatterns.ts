import { PHIPattern, PHICategory } from '../types/phi.js';

/**
 * Comprehensive PHI patterns based on HIPAA regulations and healthcare standards
 * Covers EMR records, e-prescribing, and other healthcare data formats
 */
export const PHI_PATTERNS: PHIPattern[] = [
  // Social Security Numbers
  {
    name: 'SSN',
    description: 'Social Security Number',
    regex: /\b\d{3}-?\d{2}-?\d{4}\b/g,
    category: PHICategory.DIRECT_IDENTIFIER,
    severity: 'HIGH',
    replacement: 'XXX-XX-XXXX'
  },

  // Medical Record Numbers (various formats)
  {
    name: 'MRN',
    description: 'Medical Record Number',
    regex: /\b(?:MRN|mrn|medical[\s-]?record[\s-]?(?:number|#|num))[\s:]*(\d{6,12})\b/gi,
    category: PHICategory.HEALTHCARE_ID,
    severity: 'HIGH',
    replacement: 'MRN: [REDACTED]'
  },

  // Patient ID patterns
  {
    name: 'PATIENT_ID',
    description: 'Patient ID Number',
    regex: /\b(?:patient[\s-]?id|pid|pt[\s-]?id)[\s:]*([A-Z0-9]{6,12})\b/gi,
    category: PHICategory.HEALTHCARE_ID,
    severity: 'HIGH',
    replacement: 'PATIENT_ID: [REDACTED]'
  },

  // Phone Numbers
  {
    name: 'PHONE',
    description: 'Phone Numbers',
    regex: /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
    category: PHICategory.CONTACT,
    severity: 'HIGH',
    replacement: '(XXX) XXX-XXXX'
  },

  // Email Addresses
  {
    name: 'EMAIL',
    description: 'Email Addresses',
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    category: PHICategory.CONTACT,
    severity: 'HIGH',
    replacement: '[EMAIL_REDACTED]'
  },

  // Names (Person Names - more healthcare specific)
  {
    name: 'PERSON_NAME',
    description: 'Person Names',
    regex: /\b(?:patient|dr|doctor|mr|mrs|ms)[\s.]([A-Z][a-z]+\s+[A-Z][a-z]+)\b/gi,
    category: PHICategory.DIRECT_IDENTIFIER,
    severity: 'HIGH',
    replacement: '[NAME_REDACTED]'
  },

  // Insurance ID Numbers
  {
    name: 'INSURANCE_ID',
    description: 'Insurance ID Numbers',
    regex: /\b(?:insurance[\s-]?id|member[\s-]?id|policy[\s-]?(?:number|#))[\s:]*([A-Z0-9]{6,15})\b/gi,
    category: PHICategory.HEALTHCARE_ID,
    severity: 'HIGH',
    replacement: 'INSURANCE_ID: [REDACTED]'
  },

  // Medicare Numbers
  {
    name: 'MEDICARE',
    description: 'Medicare Numbers',
    regex: /\b\d{3}-\d{2}-\d{4}[A-Z]\d?\b/g,
    category: PHICategory.HEALTHCARE_ID,
    severity: 'HIGH',
    replacement: 'XXX-XX-XXXXX'
  },

  // DEA Numbers (Drug Enforcement Administration)
  {
    name: 'DEA_NUMBER',
    description: 'DEA Number for Prescribing',
    regex: /\b[A-Z]{2}\d{7}\b/g,
    category: PHICategory.HEALTHCARE_ID,
    severity: 'HIGH',
    replacement: '[DEA_REDACTED]'
  },

  // NPI (National Provider Identifier)
  {
    name: 'NPI',
    description: 'National Provider Identifier',
    regex: /\b(?:NPI|npi)[\s:]*(\d{10})\b/gi,
    category: PHICategory.HEALTHCARE_ID,
    severity: 'HIGH',
    replacement: 'NPI: [REDACTED]'
  },

  // Dates (various formats - healthcare specific)
  {
    name: 'DATE',
    description: 'Date Formats',
    regex: /\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{4}|\d{4}[/-]\d{1,2}[/-]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})\b/gi,
    category: PHICategory.TEMPORAL,
    severity: 'MEDIUM',
    replacement: '[DATE_REDACTED]'
  },

  // Addresses (US format)
  {
    name: 'ADDRESS',
    description: 'Street Addresses',
    regex: /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Way|Court|Ct)\b/gi,
    category: PHICategory.GEOGRAPHIC,
    severity: 'HIGH',
    replacement: '[ADDRESS_REDACTED]'
  },

  // ZIP Codes
  {
    name: 'ZIP_CODE',
    description: 'ZIP Codes',
    regex: /\b\d{5}(?:-\d{4})?\b/g,
    category: PHICategory.GEOGRAPHIC,
    severity: 'MEDIUM',
    replacement: 'XXXXX'
  },

  // Prescription Numbers
  {
    name: 'PRESCRIPTION_NUMBER',
    description: 'Prescription Numbers',
    regex: /\b(?:rx|prescription|script)[\s#:]*([A-Z0-9]{6,12})\b/gi,
    category: PHICategory.HEALTHCARE_ID,
    severity: 'HIGH',
    replacement: 'RX: [REDACTED]'
  },

  // Lab Result IDs
  {
    name: 'LAB_ID',
    description: 'Laboratory Result IDs',
    regex: /\b(?:lab[\s-]?id|specimen[\s-]?id|test[\s-]?id)[\s:]*([A-Z0-9]{6,15})\b/gi,
    category: PHICategory.HEALTHCARE_ID,
    severity: 'HIGH',
    replacement: 'LAB_ID: [REDACTED]'
  },

  // Account Numbers
  {
    name: 'ACCOUNT_NUMBER',
    description: 'Account Numbers',
    regex: /\b(?:account|acct)[\s#:]*([A-Z0-9]{6,15})\b/gi,
    category: PHICategory.FINANCIAL,
    severity: 'HIGH',
    replacement: 'ACCOUNT: [REDACTED]'
  },

  // Credit Card Numbers (basic pattern)
  {
    name: 'CREDIT_CARD',
    description: 'Credit Card Numbers',
    regex: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    category: PHICategory.FINANCIAL,
    severity: 'HIGH',
    replacement: 'XXXX-XXXX-XXXX-XXXX'
  },

  // IP Addresses
  {
    name: 'IP_ADDRESS',
    description: 'IP Addresses',
    regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    category: PHICategory.DIRECT_IDENTIFIER,
    severity: 'MEDIUM',
    replacement: 'XXX.XXX.XXX.XXX'
  },

  // URLs
  {
    name: 'URL',
    description: 'Web URLs',
    regex: /https?:\/\/[^\s]+/gi,
    category: PHICategory.DIRECT_IDENTIFIER,
    severity: 'MEDIUM',
    replacement: '[URL_REDACTED]'
  },

  // Vehicle Identifiers (VIN)
  {
    name: 'VIN',
    description: 'Vehicle Identification Numbers',
    regex: /\b[A-HJ-NPR-Z0-9]{17}\b/g,
    category: PHICategory.DIRECT_IDENTIFIER,
    severity: 'MEDIUM',
    replacement: '[VIN_REDACTED]'
  },

  // License Numbers (various types)
  {
    name: 'LICENSE_NUMBER',
    description: 'License Numbers',
    regex: /\b(?:license|permit)[\s#:]*([A-Z0-9]{6,12})\b/gi,
    category: PHICategory.DIRECT_IDENTIFIER,
    severity: 'MEDIUM',
    replacement: 'LICENSE: [REDACTED]'
  },

  // Pharmacy Information
  {
    name: 'PHARMACY_ID',
    description: 'Pharmacy Identifiers',
    regex: /\b(?:pharmacy|pharm)[\s-]?(?:id|number)[\s:]*([A-Z0-9]{6,12})\b/gi,
    category: PHICategory.HEALTHCARE_ID,
    severity: 'HIGH',
    replacement: 'PHARMACY_ID: [REDACTED]'
  }
];

export function getPatternsByCategory(category: PHICategory): PHIPattern[] {
  return PHI_PATTERNS.filter(pattern => pattern.category === category);
}

export function getHighSeverityPatterns(): PHIPattern[] {
  return PHI_PATTERNS.filter(pattern => pattern.severity === 'HIGH');
}