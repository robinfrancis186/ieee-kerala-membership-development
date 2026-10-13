# IEEE Membership Development in Kerala

An independent, static resource for IEEE Student Branch volunteers in Kerala. It explains MGA dues allocation, estimates the published Student Branch rebate, and helps discover scholarships, grants, awards, and travel support.

## Run locally

```sh
python3 -m http.server 5176
```

Open `http://127.0.0.1:5176/`. Run the calculation and filter tests with `npm test`.

## Design

- Plain HTML, CSS, and ES modules with no build step. Colours, radii, and fonts are CSS custom properties at the top of `styles.css`.
- Light and dark themes follow the visitor's system setting. The header toggle overrides it and stores the choice in `localStorage`.
- Headings use Bricolage Grotesque and body text uses Plus Jakarta Sans, both loaded from Google Fonts with system-font fallbacks.
- Funding and event lists show a short preview first (fewer on phones) with a button to show the rest.

## Data and limitations

- The reviewed opportunity shortlist is a dated snapshot with official source links. Always confirm a live call's dates, eligibility, and amount on its source page.
- Search can query the public IEEE Students catalogue across its funding categories. Search terms are sent to `students.ieee.org`; the local shortlist remains available if that service is unavailable.
- The calculator estimates the Student Branch's published annual allotment and per-member rebate only. The optional 12% figure illustrates the aggregate MGA allocation and is not an individual unit payout.
- This is an independently maintained volunteer resource, not an official IEEE website.
