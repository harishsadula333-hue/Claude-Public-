# Sundarlysh Events – Catalogue (4 pages)

- `Sundarlysh-Catalogue.pdf`: print-ready A4, 4 pages (also good for sharing on WhatsApp)
- `Sundarlysh-Catalogue-page1..4.png`: one image per page (1588×2246) for WhatsApp, Instagram or Stories

| Page | Content |
|---|---|
| 1 · Cover | Logo, "Experience Bars & Creative Workshops", arch photos (Workshops · Wedding Bars · Christmas Specials), 55+ experiences, occasions, Bengaluru · Hyderabad, @sundarlyshevents |
| 2 · Signature Experiences | The 9 top activities as photo cards: Weddings & Parties (Ubtan Bar, Kundan Mehendi & Glitter Bar, Decoden Frosting Bar), All Ages (Sand Candle Making, Bedazzle, 3D Art for cafés), and a Christmas Specials band (Cake & Paint, Mini Canvas Tree Lighting, Pipe-Cleaner Christmas Trees) |
| 3 · Weddings · Beauty · Food | All 19 wedding activities as a numbered menu, Beauty & DIY workshops, Food & Culinary Art workshops, and a "Perfect for" row (Haldi, Mehendi, Sangeet, Reception, Pre-wedding parties) |
| 4 · Creative Workshops + Booking | Art & Painting (7), Home Décor & Lifestyle (9), And Many More (12, kids' items badged), How it works, a booking band with logo, Instagram handle and QR code |

Notes:
- "Nail Art & Nail Styling" and "Nail Art Workshop" are merged into one line.
- Photos are AI-generated illustrations, and page 4 says "Images are for illustration only". Replace them with real event photos when available. They are in `source/assets/` and keep the same file names.
- The QR code opens https://www.instagram.com/sundarlyshevents/.

## Editing
Edit `source/catalog.html` (text and layout), then re-render:

    cd source && node render_cat.js catalog.html ../Sundarlysh-Catalogue.pdf ../Sundarlysh-Catalogue

This needs Node with Playwright and Chromium. Fonts (Cormorant Garamond, Great Vibes, Montserrat; SIL Open Font License) are included in `source/fonts/`.
