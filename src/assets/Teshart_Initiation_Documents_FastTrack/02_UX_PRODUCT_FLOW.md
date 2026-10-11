# Teshart — UX & Product Flow Specification
Version: 0.1 — Initiation Phase

## 1. Experience model

The product has two connected experiences:

### Discovery
Emotional, editorial, calm and trust-building.

### Transaction
Focused, progressive and practical.

Do not make the homepage behave like a dense ecommerce catalog.

## 2. Primary journey

```text
HOME
  ↓
Create My Keepsake
  ↓
Upload Photo
  ↓
Choose Artwork
  ↓
Choose Size
  ↓
Choose Finish
  ↓
Delivery Details
  ↓
Review Order
  ↓
Payment
  ↓
Order Confirmed
  ↓
Track Order
```

## 3. Wizard behavior

The wizard must:
- show current progress;
- preserve completed inputs;
- allow safe backward navigation;
- validate only what is necessary at each step;
- clearly show price when price becomes meaningful;
- prevent accidental loss of uploaded/configured data;
- provide a recovery path after errors.

## 4. Step requirements

### Step 1 — Upload photo
Purpose: establish the input for the commissioned artwork.

Must include:
- upload control;
- supported formats;
- maximum file size;
- simple quality guidance;
- selected image preview;
- replace/remove option;
- upload error state.

### Step 2 — What would you like us to create?
Purpose: identify artwork type.

Examples:
- Couple Portrait
- Family Portrait
- Pet Portrait
- Individual Portrait
- Other/custom request

The actual product catalogue is configurable and should not be hard-coded into the UX.

### Step 3 — Choose your size
Purpose: select physical artwork size.

Each option should communicate:
- size;
- price;
- meaningful short description where useful.

### Step 4 — Choose your finish
Purpose: select available finishing option.

Show visual representation where the difference matters.

### Step 5 — Delivery details
Collect:
- full name;
- phone;
- email;
- address;
- city;
- state;
- pincode;
- landmark where useful.

Validate Indian pincode/phone/email appropriately without making the form hostile.

### Step 6 — Review
Show:
- source image thumbnail;
- artwork type;
- size;
- finish;
- delivery details;
- subtotal;
- delivery charge;
- discount if applicable;
- total;
- relevant policies.

Allow editing each section without losing progress.

### Step 7 — Payment
Keep this screen focused.
- show total;
- show payment provider;
- explain what happens after payment;
- avoid unnecessary navigation.

### Step 8 — Confirmation
Show:
- confirmation state;
- order number;
- amount paid;
- current production status;
- expected next step;
- track order action;
- support contact.

## 5. Tracking UX

Recommended state progression:

```text
Order placed
Payment confirmed
Artwork being created
Quality check
Packed
Shipped
Out for delivery
Delivered
```

The UI should make the current state obvious without overwhelming the customer with internal operational detail.

## 6. Trust UX

Trust should be distributed across the experience:
- real artwork;
- customer words;
- clear process;
- transparent pricing;
- privacy reassurance for uploaded photographs;
- payment security cues;
- delivery information;
- clear support route.

Avoid fake urgency, fake scarcity and exaggerated claims.

## 7. Accessibility
Required:
- keyboard access;
- visible focus;
- labels for controls;
- useful error text;
- adequate touch targets;
- meaningful alt text;
- no information conveyed by color alone;
- logical heading hierarchy.

## 8. UX invariants
Do not change these without an explicit product decision:
- primary CTA concept: Create My Keepsake;
- photo-first ordering concept;
- progressive configuration;
- review before payment;
- confirmation + tracking after payment;
- handmade/personal emotional positioning;
- mobile-first usability.
