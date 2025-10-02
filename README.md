## Evonik Coordination Hub – Digital Transformation Dashboard

A lightweight, static multi-page demo that showcases real-time cross-system coordination across Sales, Global Supply Chain, Local Supply Chain, and Production. It simulates how manual, siloed processes can be automated and synchronized within minutes instead of weeks.

### Highlights
- **Single-click demo scenarios**: Trigger realistic coordination flows (equipment failure, bulk order sync, supply chain adjustment, global capacity rebalancing).
- **Multi-window sync**: Open stakeholder pages manually; updates propagate instantly using `localStorage` events.
- **No build or backend required**: Pure HTML/CSS/JS, run locally by opening `index.html`.

---

## Project Structure
- `index.html`: Coordination Hub (home). Launch demo flows and view consolidated status, timeline, and notifications.
- `sales.html`: Sales team view. Receives events like bulk order sync and new orders.
- `global-supply-chain.html`: Global view. Simulates cross-site capacity rebalancing.
- `local-supply-chain.html`: Local SC view. Simulates SAP/Excel-style procurement and inventory triggers.
- `production.html`: Plant production view. Equipment status, OEE, maintenance, and predictive analytics.
- `optimizer.html`: AI Decision Optimizer. Conversational UI that visualizes production status, tank levels, cost analysis, and recommends crisis scenarios with explainability.
- `shared-styles.css`: Common CSS styles and design system used across all pages for consistent branding and UI components.

> Pages now use shared styles for consistency while maintaining portability. Each page includes its own inline styles for page-specific elements.

---

## Getting Started
1. Clone or download this repository to your machine.
2. Open `index.html` in a modern browser (Chrome, Edge, or Firefox recommended).
3. For the best demo, optionally open the other pages in separate tabs/windows.

> Tip: You can also serve the folder via a simple static server, but it is not required.

---

## Running the Demo
### Option A: Quick tour from the Hub
1. Open `index.html`.
2. Use the buttons in "Live Demo Controls":
   - `⚙️ Equipment Failure Auto-Response`
   - `📊 Bulk Order SAP Sync`
   - `🔄 Supply Chain Auto-Adjustment`
   - `🌏 Global Capacity Rebalancing`
  - `🔄 Reset Demo`
3. Watch the status cards, alerts banner, notifications panel, and coordination timeline update in real time.

### Option B: Multi-window coordination
1. Manually open these pages in separate tabs/windows:
   - `sales.html`
   - `global-supply-chain.html`
   - `local-supply-chain.html`
   - `production.html`
2. Trigger any scenario from the hub and observe synchronized updates across all open windows.

---

## Key Concepts
- **Event bus via localStorage**: Pages broadcast coordination events by writing a JSON payload to the `localStorage` key `evonik_coordination_event`. Other pages listen for the browser `storage` event and react accordingly.
- **Stateless demo**: Events are transient (the key is cleared shortly after write). UI reflects the latest state; `Reset Demo` reinitializes visuals and metrics.
- **Self-contained UI**: All pages include their own styles and scripts; no external dependencies.

### Event Types (cross-page protocol)
All events are emitted to `localStorage` as `{ type, data, timestamp, source }` under key `evonik_coordination_event`.

- From Hub (index.html):
  - `equipment_failure` { unit, impact }
  - `bulk_order_sync` { orders, total_mt }
  - `supply_chain_adjustment` { delay_days, impact_mt }
  - `global_capacity_rebalancing` { from, to, mt }
  - `reset` {}

- From Global (`global-supply-chain.html`):
  - `global_capacity_upload` { optimizations_count, efficiency_gain, file_name, processing_time }
  - `ai_optimization_complete` { affected_sites[], events_increment, processing_time }
  - `global_sync_complete` { status }

- Sales accepts: `equipment_failure`, `bulk_order_sync`, `reset`
- Local SC accepts: `equipment_failure`, `supply_chain_adjustment`, `reset`
- Production accepts: `equipment_failure`, `reset`

Tip: Some handlers accept flexible payload keys (e.g., orders or orders_count) for convenience.

---

## Troubleshooting
 
- **No cross-window updates**: The `storage` event only fires across different windows/tabs of the same origin. Ensure all pages are opened from the same folder/location.
- **Local file security quirks**: Some browsers restrict `localStorage` for `file://` URLs in certain modes. If you see inconsistent behavior, start a simple local server:

```bash
# From the project directory
# Option 1: Python 3
python -m http.server 5500
# Option 2: Node (if installed)
npx http-server -p 5500 --cors --silent
```

Then open `http://localhost:5500/index.html`.

- **Nothing updates after a while**: Click `🔄 Reset Demo` on the hub to restore initial state.

---

## Browser Support
Tested on recent versions of Chrome and Edge. Firefox works for most features. Safari may require serving via `http://` instead of `file://` due to storage event policies.

---

## Extending the Demo
- Add real data sources or APIs by replacing the simulated event broadcasters.
- Customize the design system by modifying `shared-styles.css` for consistent branding across all pages.
- Persist event history by storing an array of events instead of transient keys.

---

## License
Internal demo content. Replace with your preferred license if distributing.
