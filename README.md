# Healthcare Data Redaction MCP Server

A **local-first, privacy-first** HIPAA-compliant Model Context Protocol (MCP) server for healthcare data redaction and masking. This server provides comprehensive PHI (Protected Health Information) detection and redaction capabilities for JSON, XML, and plain text data formats.

## 🛡️ Privacy-First Design

**🏠 LOCAL PROCESSING ONLY**: Your PHI data never leaves your device
- **Zero External Transmission**: No data sent to external servers or APIs
- **Zero Data Retention**: No PHI data stored persistently on disk
- **Memory-Only Processing**: All operations occur in temporary memory
- **Automatic Cleanup**: Data automatically cleared after each operation

**🔐 ENCRYPTION READY**: AES-256 encryption available for additional protection
- **Local Key Generation**: Encryption keys generated on your device
- **No Key Transmission**: Keys never leave your local environment
- **Optional Encryption**: Use encryption features if required by your organization

**📋 AUDIT-READY**: Comprehensive privacy verification and compliance reporting
- **Zero Retention Verification**: Confirm no data persistence with audit tools
- **Privacy Statement Generation**: Detailed privacy guarantees documentation  
- **Compliance Reporting**: HIPAA compliance reports with technical details
- **Secure Session Management**: Explicit memory clearing capabilities

## 🏥 Features

### HIPAA Compliance
- **Comprehensive PHI Detection**: Identifies 20+ types of protected health information
- **Multiple Data Formats**: Supports JSON, XML, and plain text
- **AES-256 Encryption**: HIPAA-compliant encryption for data at rest and in transit
- **Audit Trail Support**: Secure logging capabilities for compliance tracking
- **Risk Assessment**: Analyzes data for PHI risk levels before processing

### PHI Categories Detected

#### Direct Identifiers (HIGH Risk)
- **Names**: Patient names, provider names, family member names
- **Social Security Numbers**: All standard SSN formats
- **Contact Information**: Phone numbers, email addresses, URLs
- **Geographic Data**: Addresses, ZIP codes (< 20,000 population)
- **Account Numbers**: Financial account numbers, credit card numbers

#### Healthcare Identifiers (HIGH Risk)
- **Medical Record Numbers (MRN)**: Various hospital and clinic formats
- **Patient IDs**: Health system patient identifiers
- **Insurance IDs**: Health plan member IDs, policy numbers
- **Medicare/Medicaid Numbers**: Government insurance identifiers
- **DEA Numbers**: Drug Enforcement Administration prescriber IDs
- **NPI Numbers**: National Provider Identifiers
- **Prescription Numbers**: Pharmacy prescription identifiers
- **Laboratory IDs**: Test result and specimen identifiers
- **Pharmacy IDs**: Pharmacy system identifiers

#### Clinical & Administrative (MEDIUM/LOW Risk)
- **Temporal Data**: Dates, appointment times, admission/discharge dates
- **License Numbers**: Professional license identifiers
- **Vehicle Identifiers**: VIN numbers
- **Device Identifiers**: Medical device serial numbers
- **IP Addresses**: Network identifiers

### Specialized Healthcare Support
- **EMR Records**: Electronic Medical Record data redaction
- **E-Prescribing**: Medication prescription data protection
- **HL7 Messages**: Healthcare messaging standard support
- **Claims Data**: Insurance claims information redaction
- **Lab Results**: Laboratory data protection
- **Imaging Reports**: Radiology and diagnostic report redaction

## 📋 Prerequisites

- Node.js 18+ 
- TypeScript
- MCP-compatible client (e.g., Claude Desktop, custom MCP client)

## 🚀 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/amafjarkasi/healthcare-redaction-mcp.git
   cd healthcare-redaction-mcp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

## 🛠️ MCP Tools Available

### `redact_healthcare_data`
Primary tool for redacting PHI from healthcare data.

**Parameters:**
- `data` (required): The healthcare data to redact (JSON, XML, or plain text)
- `options` (optional): Redaction configuration
  - `preserveFormat`: Maintain original data formatting (default: true)
  - `maskCharacter`: Character for masking (default: "*")
  - `encryptionKey`: 64-character hex encryption key for additional security
  - `categories`: Array of specific PHI categories to redact

**Example:**
```json
{
  "data": "Patient John Doe, DOB: 01/15/1980, SSN: 123-45-6789, MRN: 12345678",
  "options": {
    "preserveFormat": true,
    "categories": ["DIRECT_IDENTIFIER", "HEALTHCARE_ID"]
  }
}
```

### `analyze_phi_risk`
Analyzes healthcare data for PHI risk without redacting.

**Parameters:**
- `data` (required): Healthcare data to analyze

**Returns:**
- Risk level assessment (LOW/MEDIUM/HIGH)
- PHI detection summary
- Compliance recommendations
- Category breakdown

### `generate_encryption_key`
Generates a HIPAA-compliant 256-bit AES encryption key.

**Returns:**
- Secure 64-character hex encryption key
- Usage instructions and warnings

### `validate_encryption_key`
Validates encryption key format and strength.

**Parameters:**
- `key` (required): Encryption key to validate

### `list_phi_patterns`
Lists all available PHI detection patterns.

**Parameters:**
- `category` (optional): Filter by specific PHI category

## 🛡️ Privacy-First Tools

### `verify_data_privacy`
**NEW** - Verify that no data is stored locally or transmitted externally. Confirms zero data retention policy.

**Parameters:**
- `include_audit` (optional): Include detailed privacy audit information (default: false)

**Example:**
```json
{
  "include_audit": true
}
```

### `get_privacy_statement`
**NEW** - Get comprehensive privacy and security statement for the local-first MCP server.

**Parameters:** None

### `audit_data_retention`
**NEW** - Audit and confirm zero data retention policy compliance.

**Parameters:**
- `detailed_report` (optional): Generate detailed audit report with technical verification (default: false)

**Example:**
```json
{
  "detailed_report": true
}
```

### `generate_compliance_report`
**NEW** - Generate comprehensive HIPAA compliance report emphasizing local-first design.

**Parameters:**
- `include_technical_details` (optional): Include technical implementation details (default: true)
- `format` (optional): Output format - 'json', 'markdown', or 'text' (default: 'json')

**Example:**
```json
{
  "format": "markdown",
  "include_technical_details": true
}
```

### `secure_wipe_session`
**NEW** - Explicitly clear any temporary data from memory (defensive privacy measure).

**Parameters:**
- `force_gc` (optional): Force garbage collection after wiping (default: true)

**Example:**
```json
{
  "force_gc": true
}
```

## 📊 Usage Examples

### Basic Text Redaction
```json
{
  "tool": "redact_healthcare_data",
  "arguments": {
    "data": "Patient Sarah Smith (SSN: 555-44-3333) scheduled for 03/15/2024 at phone (555) 123-4567"
  }
}
```

### JSON EMR Data
```json
{
  "tool": "redact_healthcare_data", 
  "arguments": {
    "data": "{\"patient\": {\"name\": \"John Doe\", \"mrn\": \"MRN123456\", \"dob\": \"1980-01-15\", \"ssn\": \"123-45-6789\"}}",
    "options": {
      "preserveFormat": true,
      "encryptionKey": "abcd1234...5678" 
    }
  }
}
```

### XML HL7 Message
```json
{
  "tool": "redact_healthcare_data",
  "arguments": {
    "data": "<Patient><Name>Jane Doe</Name><SSN>987-65-4321</SSN><Phone>(555)987-6543</Phone></Patient>"
  }
}
```

### Risk Assessment
```json
{
  "tool": "analyze_phi_risk",
  "arguments": {
    "data": "Medical record contains patient demographics and clinical notes"
  }
}
```

## 🔐 Security Features

### Encryption
- **AES-256-CBC**: Industry-standard encryption
- **Secure Key Generation**: Cryptographically secure random keys
- **IV Protection**: Unique initialization vectors for each encryption
- **Key Validation**: Ensures proper key strength and format

### Masking Options
- **Format Preservation**: Maintains data structure for system compatibility
- **Custom Masking**: Configurable mask characters and patterns
- **Selective Redaction**: Target specific PHI categories
- **Smart Replacement**: Context-aware redaction patterns

### Compliance Features
- **Audit Logging**: Secure hash-based audit trails
- **Risk Assessment**: Pre-processing PHI risk analysis
- **Category Classification**: HIPAA-aligned PHI categorization
- **Data Minimization**: Only redact necessary information

## 🏗️ Architecture

```
src/
├── types/           # TypeScript type definitions
│   └── phi.ts       # PHI patterns and interfaces
├── patterns/        # PHI detection patterns
│   └── phiPatterns.ts
├── encryption/      # HIPAA encryption utilities
│   └── hipaaEncryption.ts
├── utils/          # Core redaction engine
│   └── redactionEngine.ts
└── index.ts        # MCP server implementation
```

## 🧪 Testing

Test the server with sample healthcare data:

```bash
# Start the server in development mode
npm run dev

# Test with MCP client or integrate with Claude Desktop
```

## 📝 Configuration

### MCP Client Configuration (Claude Desktop)
Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "healthcare-redaction": {
      "command": "node",
      "args": ["/path/to/healthcare-redaction-mcp/dist/index.js"]
    }
  }
}
```

## ⚖️ Compliance Notes

### HIPAA Requirements Met
- **Administrative Safeguards**: Access controls and audit capabilities
- **Physical Safeguards**: Local processing eliminates external storage risks  
- **Technical Safeguards**: Access controls, audit logs, integrity controls, local-only processing

### Privacy-First Compliance Advantages
- **Zero Data Breach Risk**: No persistent storage = no data to breach
- **No External Dependencies**: Eliminates third-party data handling risks
- **Complete Data Sovereignty**: You maintain full control over all PHI data
- **Air-Gap Compatible**: Works in completely isolated environments
- **Audit-Ready**: Built-in compliance verification and reporting tools

### Important Disclaimers
- This tool assists with PHI redaction but does not guarantee 100% detection
- Manual review is recommended for critical healthcare data
- Consult with legal and compliance teams for specific use cases
- Regular pattern updates may be needed for new PHI formats
- **LOCAL PROCESSING ONLY**: Your responsibility to secure the local environment

### Privacy Guarantees
✅ **No Data Transmission**: PHI never leaves your local environment  
✅ **No Data Storage**: Zero retention policy enforced programmatically  
✅ **No External APIs**: All processing occurs locally  
✅ **Memory-Only Processing**: Data exists only temporarily during operations  
✅ **Automatic Cleanup**: Data automatically cleared after each operation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add comprehensive tests for new PHI patterns
4. Ensure HIPAA compliance for any new features
5. Submit a pull request with detailed documentation

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

For issues, questions, or feature requests:
- Create an issue on GitHub
- Check existing PHI patterns for coverage
- Review compliance documentation

## 🔄 Version History

- **v1.0.0**: Initial release with comprehensive PHI detection, HIPAA encryption, and MCP server implementation

---

**⚠️ IMPORTANT**: This software is provided as-is for assistance with healthcare data redaction. Always consult with legal and compliance professionals for HIPAA compliance verification in your specific use case.