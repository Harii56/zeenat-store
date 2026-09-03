# Zeenat — Online Fashion Store (Final Year Project)

A full-stack online clothing & accessories store built with **Node.js, Express, EJS**.
Categories: Dresses, Shirts, Jackets, Pants, Bags, Jewelry, Glasses — for **Women, Men & Kids**.

## Features
- Home page with hero banner, category tiles, featured products
- Shop page with gender + category filters and search
- Product detail pages with size selection and quantity
- Session-based shopping cart (add / update / remove)
- User registration & login (passwords hashed with bcrypt)
- Checkout with shipping form + mock payment (Cash on Delivery / Card)
- Orders saved to a local JSON "database" (`data/orders.json`)
- Fully responsive, custom "boutique-luxe" design (no Bootstrap/templates)

## Requirements
- [Node.js](https://nodejs.org) version 18 or higher (includes `npm`)

## How to Run (in VS Code)

1. **Open the folder** `online-store` in VS Code.
2. Open a terminal in VS Code: `Terminal > New Terminal`.
3. Install dependencies:
   ```
   npm install
   ```
4. Start the server:
   ```
   npm start
   ```
5. Open your browser and go to:
   ```
   http://localhost:3000
   ```

That's it — the store is now running locally.

## Project Structure
```
online-store/
├── server.js              # App entry point
├── data/
│   ├── products.js        # Product catalog (edit here to add/remove products)
│   ├── store.js           # Simple JSON-file database helpers
│   ├── users.json          # Auto-created — stores registered users
│   └── orders.json         # Auto-created — stores placed orders
├── routes/
│   ├── index.js            # Home page
│   ├── shop.js              # Category listing + product detail
│   ├── cart.js               # Cart add/update/remove
│   ├── auth.js               # Register/Login/Logout
│   └── checkout.js           # Checkout + order placement
├── views/                   # EJS templates (pages + partials)
└── public/
    ├── css/style.css        # All styling
    └── js/main.js             # Mobile menu + small UX scripts
```

## Notes for your project report
- **Frontend**: EJS templates + custom CSS (responsive, no external UI framework)
- **Backend**: Node.js + Express (MVC-style: routes / data / views)
- **Database**: Lightweight JSON-file storage (`data/users.json`, `data/orders.json`) — easy to explain, can be swapped for MongoDB/MySQL later if required
- **Session management**: `express-session` — used for both the shopping cart and login state
- **Security**: Passwords hashed using `bcryptjs` (never stored in plain text)
- Product images are placeholder photos pulled from `picsum.photos` — replace the `image` URLs in `data/products.js` with your own images if you want.

## Adding / Editing Products
Open `data/products.js` and edit the `products` array. Each product needs:
`id, name, gender (women/men/kids), category, price, image, description, sizes, stock`.

## Possible Extensions (bonus points ideas)
- Connect to MongoDB/MySQL instead of JSON files
- Add an admin panel to manage products/orders
- Add real payment gateway integration (Stripe/JazzCash/EasyPaisa)
- Add product reviews & ratings
- Add wishlist feature
