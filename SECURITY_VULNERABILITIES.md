# Security Vulnerabilities Report

This document tracks known security vulnerabilities in the project dependencies that cannot be automatically fixed.

## High Severity Vulnerabilities

### PDF.js Vulnerability (GHSA-wgrm-67xf-hhpq)
- **Package**: pdfjs-dist (<=4.1.392)
- **Severity**: High
- **Description**: PDF.js vulnerable to arbitrary JavaScript execution upon opening a malicious PDF
- **Affected Packages**:
  - pdfjs-dist
  - @react-pdf-viewer/core (and all dependent packages)
- **Fix Status**: No fix available
- **Mitigation Strategy**:
  - Monitor for updates to pdfjs-dist
  - Consider alternative PDF viewing libraries if a fix is not released
  - Validate and sanitize all user-provided PDF files before processing
  - Implement strict Content Security Policy (CSP) headers
  - Use sandboxed iframes when displaying PDFs
  - Limit PDF processing to client-side only (no server-side rendering)

## Recommendations

1. **Regular Monitoring**: Check for updates to these packages regularly
2. **Alternative Libraries**: Research alternative PDF processing libraries that may not have these vulnerabilities
3. **User Input Validation**: Implement strict validation and sanitization for all user-provided PDF files
4. **Security Headers**: Ensure proper security headers are set for the application
5. **Client-side Only**: Continue to process PDFs only on the client-side to minimize server exposure

## References

- [GHSA-wgrm-67xf-hhpq](https://github.com/advisories/GHSA-wgrm-67xf-hhpq)