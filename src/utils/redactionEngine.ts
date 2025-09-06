import { PHI_PATTERNS } from '../patterns/phiPatterns.js';
import { HIPAAEncryption } from '../encryption/hipaaEncryption.js';
import { PHIPattern, PHICategory, RedactionOptions, RedactionResult, DataFormat } from '../types/phi.js';
import * as xml2js from 'xml2js';

/**
 * Healthcare Data Redaction Engine
 * Provides HIPAA-compliant redaction for JSON, XML, and plain text data
 */
export class HealthcareRedactionEngine {
  private encryption: HIPAAEncryption;
  private patterns: PHIPattern[];

  constructor(customPatterns?: PHIPattern[]) {
    this.encryption = new HIPAAEncryption();
    this.patterns = [...PHI_PATTERNS];
    
    if (customPatterns) {
      this.patterns = [...this.patterns, ...customPatterns];
    }
  }

  /**
   * Main redaction method - detects format and applies appropriate redaction
   */
  public async redactData(input: string, options: RedactionOptions = {}): Promise<RedactionResult> {
    const format = this.detectFormat(input);
    
    switch (format.type) {
      case 'JSON':
        return this.redactJSON(input, options);
      case 'XML':
        return this.redactXML(input, options);
      case 'TEXT':
      default:
        return this.redactText(input, options);
    }
  }

  /**
   * Redact JSON data while preserving structure
   */
  public async redactJSON(jsonString: string, options: RedactionOptions = {}): Promise<RedactionResult> {
    try {
      const jsonObject = JSON.parse(jsonString);
      const result = this.redactObject(jsonObject, options);
      const redactedString = JSON.stringify(result.redacted, null, 2);
      
      return {
        original: jsonString,
        redacted: options.encryptionKey ? 
          this.encryption.encrypt(redactedString, options.encryptionKey) : redactedString,
        matches: result.matches,
        encrypted: !!options.encryptionKey
      };
    } catch (error) {
      // If JSON parsing fails, treat as plain text
      return this.redactText(jsonString, options);
    }
  }

  /**
   * Redact XML data while preserving structure
   */
  public async redactXML(xmlString: string, options: RedactionOptions = {}): Promise<RedactionResult> {
    try {
      const parser = new xml2js.Parser();
      const builder = new xml2js.Builder();
      
      const xmlObject = await parser.parseStringPromise(xmlString);
      const result = this.redactObject(xmlObject, options);
      const redactedString = builder.buildObject(result.redacted);
      
      return {
        original: xmlString,
        redacted: options.encryptionKey ? 
          this.encryption.encrypt(redactedString, options.encryptionKey) : redactedString,
        matches: result.matches,
        encrypted: !!options.encryptionKey
      };
    } catch (error) {
      // If XML parsing fails, treat as plain text
      return this.redactText(xmlString, options);
    }
  }

  /**
   * Redact plain text data
   */
  public async redactText(text: string, options: RedactionOptions = {}): Promise<RedactionResult> {
    const matches: Array<{
      pattern: string;
      category: PHICategory;
      position: number;
      length: number;
      severity: 'HIGH' | 'MEDIUM' | 'LOW';
    }> = [];

    let redactedText = text;
    const applicablePatterns = this.getApplicablePatterns(options);

    // Apply patterns in order of severity (HIGH first)
    const sortedPatterns = applicablePatterns.sort((a, b) => {
      const severityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    for (const pattern of sortedPatterns) {
      let match;
      // Reset regex lastIndex to avoid issues with global flags
      pattern.regex.lastIndex = 0;
      
      while ((match = pattern.regex.exec(redactedText)) !== null) {
        matches.push({
          pattern: pattern.name,
          category: pattern.category,
          position: match.index,
          length: match[0].length,
          severity: pattern.severity
        });

        // Replace the match with appropriate redaction
        const replacement = options.preserveFormat ? 
          this.encryption.maskData(match[0], options.maskCharacter) : 
          pattern.replacement;
          
        redactedText = redactedText.substring(0, match.index) + 
          replacement + 
          redactedText.substring(match.index + match[0].length);
        
        // Adjust regex position after replacement
        pattern.regex.lastIndex = match.index + replacement.length;
      }
    }

    return {
      original: text,
      redacted: options.encryptionKey ? 
        this.encryption.encrypt(redactedText, options.encryptionKey) : redactedText,
      matches,
      encrypted: !!options.encryptionKey
    };
  }

  /**
   * Recursively redact object properties
   */
  private redactObject(obj: any, options: RedactionOptions): { redacted: any; matches: any[] } {
    const matches: any[] = [];
    
    if (typeof obj === 'string') {
      // Use sync version for string redaction in object context
      const result = this.redactTextSync(obj, { ...options, encryptionKey: undefined }); // Don't encrypt individual strings
      matches.push(...result.matches);
      return { redacted: result.redacted, matches };
    }
    
    if (Array.isArray(obj)) {
      const redactedArray: any[] = [];
      for (const item of obj) {
        const result = this.redactObject(item, options);
        redactedArray.push(result.redacted);
        matches.push(...result.matches);
      }
      return { redacted: redactedArray, matches };
    }
    
    if (obj !== null && typeof obj === 'object') {
      const redactedObject: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const result = this.redactObject(value, options);
        redactedObject[key] = result.redacted;
        matches.push(...result.matches);
      }
      return { redacted: redactedObject, matches };
    }
    
    return { redacted: obj, matches };
  }

  /**
   * Synchronous version of redactText for internal use
   */
  private redactTextSync(text: string, options: RedactionOptions = {}): RedactionResult {
    const matches: Array<{
      pattern: string;
      category: PHICategory;
      position: number;
      length: number;
      severity: 'HIGH' | 'MEDIUM' | 'LOW';
    }> = [];

    let redactedText = text;
    const applicablePatterns = this.getApplicablePatterns(options);

    // Apply patterns in order of severity (HIGH first)
    const sortedPatterns = applicablePatterns.sort((a, b) => {
      const severityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    for (const pattern of sortedPatterns) {
      let match;
      // Reset regex lastIndex to avoid issues with global flags
      pattern.regex.lastIndex = 0;
      
      while ((match = pattern.regex.exec(redactedText)) !== null) {
        matches.push({
          pattern: pattern.name,
          category: pattern.category,
          position: match.index,
          length: match[0].length,
          severity: pattern.severity
        });

        // Replace the match with appropriate redaction
        const replacement = options.preserveFormat ? 
          this.encryption.maskData(match[0], options.maskCharacter) : 
          pattern.replacement;
          
        redactedText = redactedText.substring(0, match.index) + 
          replacement + 
          redactedText.substring(match.index + match[0].length);
        
        // Adjust regex position after replacement
        pattern.regex.lastIndex = match.index + replacement.length;
      }
    }

    return {
      original: text,
      redacted: redactedText,
      matches,
      encrypted: false
    };
  }

  /**
   * Detect input data format
   */
  private detectFormat(input: string): DataFormat {
    const trimmed = input.trim();
    
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        JSON.parse(trimmed);
        return { type: 'JSON', content: input };
      } catch {
        // Fall through to other checks
      }
    }
    
    if (trimmed.startsWith('<') && trimmed.includes('>')) {
      return { type: 'XML', content: input };
    }
    
    return { type: 'TEXT', content: input };
  }

  /**
   * Get applicable patterns based on options
   */
  private getApplicablePatterns(options: RedactionOptions): PHIPattern[] {
    let patterns = this.patterns;
    
    if (options.categories && options.categories.length > 0) {
      patterns = patterns.filter(pattern => 
        options.categories!.includes(pattern.category)
      );
    }
    
    if (options.customPatterns) {
      patterns = [...patterns, ...options.customPatterns];
    }
    
    return patterns;
  }

  /**
   * Add custom PHI patterns
   */
  public addCustomPattern(pattern: PHIPattern): void {
    this.patterns.push(pattern);
  }

  /**
   * Get all available patterns
   */
  public getPatterns(): PHIPattern[] {
    return [...this.patterns];
  }

  /**
   * Generate encryption key
   */
  public generateEncryptionKey(): string {
    return this.encryption.generateKey();
  }

  /**
   * Validate encryption key
   */
  public validateEncryptionKey(key: string): boolean {
    return this.encryption.validateKeyStrength(key);
  }
}