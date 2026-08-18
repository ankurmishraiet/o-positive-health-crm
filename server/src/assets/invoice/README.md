# Invoice Assets

This directory contains assets used in invoice generation.

## Required Files

1. **logo.png** - O Positive Health logo (recommended size: 200x60px)
   - Displayed at the top of the invoice

2. **stamp.png** - Company stamp image (recommended size: 150x150px)
   - Displayed in the signature section

3. **signature.png** - Authorized signature image (recommended size: 200x80px)
   - Displayed at the bottom right of the invoice

## Usage

Place the required image files in this directory. The PDF generator service will automatically include them in generated invoices.

If the images are not present, the invoice will still be generated but without the images.

## Supported Formats

- PNG (recommended)
- JPEG/JPG

## Notes

- Ensure images have a transparent background for better appearance
- Use high-quality images for professional-looking invoices
- Keep file sizes reasonable (< 1MB per image) for faster generation
