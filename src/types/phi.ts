// PHI Pattern Types
export interface PHIPattern {
  name: string;
  description: string;
  regex: RegExp;
  category: PHICategory;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  replacement: string;
}

export enum PHICategory {
  DIRECT_IDENTIFIER = 'DIRECT_IDENTIFIER',
  HEALTHCARE_ID = 'HEALTHCARE_ID', 
  TEMPORAL = 'TEMPORAL',
  GEOGRAPHIC = 'GEOGRAPHIC',
  CONTACT = 'CONTACT',
  FINANCIAL = 'FINANCIAL',
  BIOMETRIC = 'BIOMETRIC',
  CLINICAL = 'CLINICAL'
}

export interface RedactionOptions {
  preserveFormat?: boolean;
  maskCharacter?: string;
  encryptionKey?: string;
  categories?: PHICategory[];
  customPatterns?: PHIPattern[];
}

export interface RedactionResult {
  original: string;
  redacted: string;
  matches: Array<{
    pattern: string;
    category: PHICategory;
    position: number;
    length: number;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  encrypted?: boolean;
}

export interface DataFormat {
  type: 'JSON' | 'XML' | 'TEXT';
  content: string;
}