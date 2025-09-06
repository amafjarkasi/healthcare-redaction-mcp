import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync } from 'crypto';

/**
 * HIPAA-compliant encryption utilities for healthcare data
 * Implements AES-256 encryption for data at rest and in transit
 */
export class HIPAAEncryption {
  private readonly algorithm = 'aes-256-cbc';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits

  /**
   * Generate a cryptographically secure encryption key
   */
  public generateKey(): string {
    return randomBytes(this.keyLength).toString('hex');
  }

  /**
   * Encrypt sensitive data using AES-256-CBC
   */
  public encrypt(data: string, key: string): string {
    try {
      // Convert hex key to buffer
      const keyBuffer = Buffer.from(key, 'hex');
      
      // Generate random IV
      const iv = randomBytes(this.ivLength);
      
      // Create cipher
      const cipher = createCipheriv(this.algorithm, keyBuffer, iv);
      
      // Encrypt the data
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Combine IV and encrypted data
      const result = {
        iv: iv.toString('hex'),
        data: encrypted
      };
      
      return JSON.stringify(result);
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt data encrypted with encrypt method
   */
  public decrypt(encryptedData: string, key: string): string {
    try {
      // Parse the encrypted data
      const parsed = JSON.parse(encryptedData);
      const { iv, data } = parsed;
      
      // Convert hex key to buffer
      const keyBuffer = Buffer.from(key, 'hex');
      const ivBuffer = Buffer.from(iv, 'hex');
      
      // Create decipher
      const decipher = createDecipheriv(this.algorithm, keyBuffer, ivBuffer);
      
      // Decrypt the data
      let decrypted = decipher.update(data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Hash sensitive data (one-way) for logging or comparison
   */
  public hash(data: string, salt?: string): string {
    const saltToUse = salt || randomBytes(16).toString('hex');
    return pbkdf2Sync(data, saltToUse, 10000, 64, 'sha512').toString('hex');
  }

  /**
   * Securely mask data while preserving format
   */
  public maskData(data: string, maskChar: string = '*', preserveLength: boolean = true): string {
    if (!preserveLength) {
      return '[REDACTED]';
    }
    
    // Preserve format for common patterns
    if (/^\d{3}-\d{2}-\d{4}$/.test(data)) { // SSN
      return 'XXX-XX-XXXX';
    }
    
    if (/^\(\d{3}\)\s\d{3}-\d{4}$/.test(data)) { // Phone
      return '(XXX) XXX-XXXX';
    }
    
    if (/^\d{5}(-\d{4})?$/.test(data)) { // ZIP
      return data.length === 5 ? 'XXXXX' : 'XXXXX-XXXX';
    }
    
    // Default masking - preserve first and last character for readability
    if (data.length <= 2) {
      return maskChar.repeat(data.length);
    }
    
    return data[0] + maskChar.repeat(Math.max(0, data.length - 2)) + data[data.length - 1];
  }

  /**
   * Generate a secure audit trail hash for data access logging
   */
  public generateAuditHash(userId: string, dataType: string, timestamp: Date, action: string): string {
    const auditString = `${userId}|${dataType}|${timestamp.toISOString()}|${action}`;
    return this.hash(auditString);
  }

  /**
   * Validate encryption key strength
   */
  public validateKeyStrength(key: string): boolean {
    // Key must be 64 hex characters (32 bytes)
    if (key.length !== 64) return false;
    
    // Must be valid hex
    return /^[a-fA-F0-9]{64}$/.test(key);
  }
}