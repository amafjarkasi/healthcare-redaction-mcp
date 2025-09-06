#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { HealthcareRedactionEngine } from './utils/redactionEngine.js';
import { PHICategory } from './types/phi.js';

/**
 * HIPAA-Compliant Healthcare Data Redaction MCP Server
 * 
 * This server provides tools for redacting PHI (Protected Health Information)
 * from healthcare data in compliance with HIPAA regulations.
 */

class HealthcareRedactionMCPServer {
  private server: Server;
  private redactionEngine: HealthcareRedactionEngine;

  constructor() {
    this.server = new Server(
      {
        name: 'healthcare-redaction-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.redactionEngine = new HealthcareRedactionEngine();
    this.setupToolHandlers();
    this.setupErrorHandler();
  }

  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'redact_healthcare_data',
            description: 'Redact PHI from healthcare data (JSON, XML, or plain text) in compliance with HIPAA regulations',
            inputSchema: {
              type: 'object',
              properties: {
                data: {
                  type: 'string',
                  description: 'The healthcare data to redact (supports JSON, XML, and plain text formats)'
                },
                options: {
                  type: 'object',
                  properties: {
                    preserveFormat: {
                      type: 'boolean',
                      description: 'Whether to preserve the original format of redacted data',
                      default: true
                    },
                    maskCharacter: {
                      type: 'string',
                      description: 'Character to use for masking (default: *)',
                      default: '*'
                    },
                    encryptionKey: {
                      type: 'string',
                      description: 'Optional encryption key for additional security (64-character hex string)'
                    },
                    categories: {
                      type: 'array',
                      items: {
                        type: 'string',
                        enum: Object.values(PHICategory)
                      },
                      description: 'Specific PHI categories to redact. If not specified, all categories will be redacted.'
                    }
                  }
                }
              },
              required: ['data']
            }
          },
          {
            name: 'generate_encryption_key',
            description: 'Generate a HIPAA-compliant encryption key for secure data handling',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'validate_encryption_key', 
            description: 'Validate the strength and format of an encryption key',
            inputSchema: {
              type: 'object',
              properties: {
                key: {
                  type: 'string',
                  description: 'The encryption key to validate (should be 64-character hex string)'
                }
              },
              required: ['key']
            }
          },
          {
            name: 'list_phi_patterns',
            description: 'List all available PHI detection patterns organized by category',
            inputSchema: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  enum: Object.values(PHICategory),
                  description: 'Optional: filter patterns by specific PHI category'
                }
              }
            }
          },
          {
            name: 'analyze_phi_risk',
            description: 'Analyze healthcare data for PHI risk without redacting (for assessment purposes)',
            inputSchema: {
              type: 'object',
              properties: {
                data: {
                  type: 'string',
                  description: 'The healthcare data to analyze for PHI risk'
                }
              },
              required: ['data']
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'redact_healthcare_data':
            return await this.handleRedactHealthcareData(args);
          
          case 'generate_encryption_key':
            return await this.handleGenerateEncryptionKey();
          
          case 'validate_encryption_key':
            return await this.handleValidateEncryptionKey(args);
          
          case 'list_phi_patterns':
            return await this.handleListPHIPatterns(args);
          
          case 'analyze_phi_risk':
            return await this.handleAnalyzePHIRisk(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
            }
          ],
          isError: true
        };
      }
    });
  }

  private async handleRedactHealthcareData(args: any) {
    const { data, options = {} } = args;
    
    if (!data || typeof data !== 'string') {
      throw new Error('Data parameter is required and must be a string');
    }

    // Validate encryption key if provided
    if (options.encryptionKey && !this.redactionEngine.validateEncryptionKey(options.encryptionKey)) {
      throw new Error('Invalid encryption key. Must be a 64-character hex string.');
    }

    const result = await this.redactionEngine.redactData(data, options);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            redacted_data: result.redacted,
            phi_detected: result.matches.length,
            matches: result.matches,
            encrypted: result.encrypted,
            summary: {
              total_matches: result.matches.length,
              high_severity: result.matches.filter(m => m.severity === 'HIGH').length,
              medium_severity: result.matches.filter(m => m.severity === 'MEDIUM').length,
              low_severity: result.matches.filter(m => m.severity === 'LOW').length,
              categories_detected: [...new Set(result.matches.map(m => m.category))]
            }
          }, null, 2)
        }
      ]
    };
  }

  private async handleGenerateEncryptionKey() {
    const key = this.redactionEngine.generateEncryptionKey();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            encryption_key: key,
            key_strength: '256-bit AES',
            usage: 'Store securely - this key is required for decrypting data',
            warning: 'This key will only be shown once. Store it in a secure location.'
          }, null, 2)
        }
      ]
    };
  }

  private async handleValidateEncryptionKey(args: any) {
    const { key } = args;
    
    if (!key || typeof key !== 'string') {
      throw new Error('Key parameter is required and must be a string');
    }

    const isValid = this.redactionEngine.validateEncryptionKey(key);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            valid: isValid,
            key_length: key.length,
            expected_length: 64,
            format: isValid ? 'Valid hex format' : 'Invalid format - must be 64-character hex string'
          }, null, 2)
        }
      ]
    };
  }

  private async handleListPHIPatterns(args: any) {
    const { category } = args;
    const patterns = this.redactionEngine.getPatterns();
    
    let filteredPatterns = patterns;
    if (category) {
      filteredPatterns = patterns.filter(p => p.category === category);
    }

    const patternsByCategory = filteredPatterns.reduce((acc, pattern) => {
      if (!acc[pattern.category]) {
        acc[pattern.category] = [];
      }
      acc[pattern.category].push({
        name: pattern.name,
        description: pattern.description,
        severity: pattern.severity,
        example_replacement: pattern.replacement
      });
      return acc;
    }, {} as Record<string, any[]>);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            total_patterns: filteredPatterns.length,
            filter_applied: category || 'none',
            patterns_by_category: patternsByCategory,
            available_categories: Object.values(PHICategory)
          }, null, 2)
        }
      ]
    };
  }

  private async handleAnalyzePHIRisk(args: any) {
    const { data } = args;
    
    if (!data || typeof data !== 'string') {
      throw new Error('Data parameter is required and must be a string');
    }

    // Analyze without actually redacting
    const result = await this.redactionEngine.redactData(data, { preserveFormat: true });
    
    const riskAnalysis = {
      risk_level: this.calculateRiskLevel(result.matches),
      phi_detected: result.matches.length > 0,
      total_phi_instances: result.matches.length,
      risk_breakdown: {
        high_risk_items: result.matches.filter(m => m.severity === 'HIGH').length,
        medium_risk_items: result.matches.filter(m => m.severity === 'MEDIUM').length,
        low_risk_items: result.matches.filter(m => m.severity === 'LOW').length
      },
      categories_found: [...new Set(result.matches.map(m => m.category))],
      recommendations: this.generateRecommendations(result.matches),
      compliance_status: result.matches.length === 0 ? 'COMPLIANT' : 'REQUIRES_REDACTION'
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(riskAnalysis, null, 2)
        }
      ]
    };
  }

  private calculateRiskLevel(matches: any[]): string {
    if (matches.length === 0) return 'LOW';
    
    const highRisk = matches.filter(m => m.severity === 'HIGH').length;
    const mediumRisk = matches.filter(m => m.severity === 'MEDIUM').length;
    
    if (highRisk > 0) return 'HIGH';
    if (mediumRisk > 0) return 'MEDIUM';
    return 'LOW';
  }

  private generateRecommendations(matches: any[]): string[] {
    const recommendations: string[] = [];
    
    if (matches.length === 0) {
      recommendations.push('Data appears to be PHI-free and HIPAA compliant');
      return recommendations;
    }

    recommendations.push('Redact all identified PHI before sharing or storing');
    
    const highRisk = matches.filter(m => m.severity === 'HIGH');
    if (highRisk.length > 0) {
      recommendations.push('HIGH PRIORITY: Critical PHI detected that must be redacted immediately');
    }

    const categories = [...new Set(matches.map(m => m.category))];
    if (categories.includes(PHICategory.DIRECT_IDENTIFIER)) {
      recommendations.push('Direct identifiers detected - these pose the highest privacy risk');
    }
    
    if (categories.includes(PHICategory.HEALTHCARE_ID)) {
      recommendations.push('Healthcare identifiers detected - ensure proper access controls');
    }

    recommendations.push('Consider implementing end-to-end encryption for data transmission');
    recommendations.push('Maintain audit logs of all data access and redaction activities');

    return recommendations;
  }

  private setupErrorHandler(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  public async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Healthcare Redaction MCP Server started successfully');
  }
}

// Start the server
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new HealthcareRedactionMCPServer();
  server.start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

export { HealthcareRedactionMCPServer };