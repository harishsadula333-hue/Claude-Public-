# Sundarlysh Events – Catalogue 2026–27 (4 pages, luxe edition)

- `Sundarlysh-Catalogue.pdf`: print-ready A4, 4 pages (also good for sharing on WhatsApp)
- `Sundarlysh-Catalogue-page1..4.png`: one image per page (1588×2246) for WhatsApp, Instagram or Stories

Design: deep-rose (burgundy) pages with gold-foil lettering alternate with cream pages featuring watercolour florals. Gold art-deco frames, a paper-grain finish, arch photo windows and a full-bleed photo mosaic. Fonts: Cinzel, Playfair Display, Pinyon Script, Cormorant Garamond and Montserrat (all SIL Open Font License).

| Page | Content |
|---|---|
| 1 · Cover | Grand gold-framed arch window with a 3-panel photo triptych (bridal mehendi · ubtan celebration · Christmas cake painting), watercolour peonies at the arch base, logo crowned above in a gold ring, gold "55+ Experiences" seal, *Experience Bars & Creative Workshops* in gold foil, occasions, Bengaluru · Hyderabad, @sundarlyshevents |
| 2 · Signature Experiences | Magazine layout of the 9 top activities (numbered 01–09): Ubtan Bar (hero), Kundan Mehendi & Glitter Bar, Decoden, Sand Candle, Bedazzle, 3D Art for cafés, and a green "Christmas Specials" band (Cake & Paint, Mini Canvas Tree Lighting, Pipe-Cleaner Trees) |
| 3 · Wedding Activities | Burgundy "menu card": three arch photos, all 19 wedding bars, Beauty & DIY and Food & Culinary workshops, Perfect for Haldi · Mehendi · Sangeet · Reception · Pre-wedding parties |
| 4 · Creative Workshops | Floral garland header, three arch-topped cards (Art & Painting · Home Décor & Lifestyle · And Many More, kids' items badged), how-it-works timeline, burgundy booking band with logo, Instagram handle and QR code |

Notes:
- "Nail Art & Nail Styling" and "Nail Art Workshop" are merged into one line.
- Photos and florals are AI-generated, and page 4 says "Images are for illustration only". Replace them with real event photos by saving over the same file names in `source/assets/`.
- The QR code opens https://www.instagram.com/sundarlyshevents/.
- No phone number is printed. Add one in `source/catalog.html` (booking band) if Sundarlysh wants it.

## Editing
    cd source && node render_cat.js catalog.html ../Sundarlysh-Catalogue.pdf ../Sundarlysh-Catalogue
(This needs Node with Playwright and Chromium.)
