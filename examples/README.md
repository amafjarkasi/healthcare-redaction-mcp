# Healthcare Redaction MCP Server - Examples

This directory contains example configurations and usage patterns for the Healthcare Redaction MCP Server.

## Claude Desktop Configuration

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "healthcare-redaction": {
      "command": "node",
      "args": ["/path/to/healthcare-redaction-mcp/dist/index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

## Example Usage

### Basic EMR Data Redaction
```javascript
// Redact a patient record
const patientRecord = `
Patient: John Doe
SSN: 123-45-6789  
DOB: 01/15/1980
Phone: (555) 123-4567
MRN: 12345678
Insurance: ABC123456789
`;

// This will redact all PHI while preserving format
```

### E-Prescribing Data
```javascript
// Prescription data with PHI
const prescription = `
Patient: Jane Smith
DEA: AB1234567
Prescription #: RX789012
NPI: 1234567890
Pharmacy: CVS #12345
`;

// Redacts prescriber and patient identifiers
```

### JSON Lab Results
```json
{
  "patient": {
    "name": "Robert Johnson",
    "mrn": "MRN567890",
    "ssn": "987-65-4321"
  },
  "lab_results": {
    "specimen_id": "LAB001234",
    "test_date": "2024-03-15",
    "provider_npi": "9876543210"
  }
}
```