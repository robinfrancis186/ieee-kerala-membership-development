# IEEE Membership Development in Kerala

An independent, static resource for IEEE Student Branch volunteers in Kerala. It explains MGA dues allocation, estimates the published Student Branch rebate, and helps discover scholarships, grants, awards, and travel support.

## Run locally

```sh
python3 -m http.server 5176
```

Open `http://127.0.0.1:5176/`. Run the calculation and filter tests with `npm test`.

## Structure

The page is a session guide in ten chapters: what IEEE is, IEEE Kerala Section at a glance, how IEEE is organised, membership and benefits, IEEE Day offers, dues and rebate, funding, humanitarian work, events, and building a branch. A chapter rail (wide screens) and a Chapters menu track the current chapter.

## Design

- Plain HTML, CSS, and ES modules with no build step. Colours, radii, and fonts are CSS custom properties at the top of `styles.css`.
- Light and dark themes follow the visitor's system setting. The header toggle overrides it and stores the choice in `localStorage`.
- Type is Geist and Geist Mono, loaded from Google Fonts with system-font fallbacks.
- History portraits, the Regions map, the YESS photo, the keralarescue.in banner, and several colour Society logos in `images/` and `logos/` come from Kerala Section membership development decks.
- Funding, catalogue, offer, and event lists show a short preview first (fewer on phones) with a button to show the rest.

## Data and limitations

- The reviewed opportunity shortlist is a dated snapshot with official source links. Always confirm a live call's dates, eligibility, and amount on its source page.
- `catalogue.mjs` is a dated snapshot of the 80 listings in the IEEE Students funding catalogue (title, IEEE unit, type, and official link only). Searching it happens in the browser; nothing is sent to another site.
- `offers.mjs` holds the IEEE Day 2026 membership offers and promo codes from ieeeday.org and the official offers graphics. The section switches to an "ended" state automatically after 17 October 2026.
- Unit logos in `logos/` are trademarks of IEEE and its Societies, downloaded from each unit's official website and used only to identify who runs a program. Units without a logo file show an abbreviation instead.
- The calculator estimates the Student Branch's published annual allotment and per-member rebate only. The optional 12% figure illustrates the aggregate MGA allocation and is not an individual unit payout.
- This is an independently maintained volunteer resource, not an official IEEE website.
