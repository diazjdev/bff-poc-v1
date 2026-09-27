const express = require("express");

const app = express();
const PORT = process.env.PORT || 4000;

const users = [
  {
    id: "usr_001",
    name: "Ada Lovelace",
    email: "ada@example.com",
    role: "admin",
    createdAt: "2024-01-15T09:00:00.000Z",
  },
  {
    id: "usr_002",
    name: "Grace Hopper",
    email: "grace@example.com",
    role: "editor",
    createdAt: "2024-03-02T14:30:00.000Z",
  },
  {
    id: "usr_003",
    name: "Alan Turing",
    email: "alan@example.com",
    role: "viewer",
    createdAt: "2024-06-21T08:15:00.000Z",
  },
  {
    id: "usr_004",
    name: "Katherine Johnson",
    email: "katherine@example.com",
    role: "editor",
    createdAt: "2024-09-08T17:45:00.000Z",
  },
  {
    id: "usr_005",
    name: "Linus Torvalds",
    email: "linus@example.com",
    role: "viewer",
    createdAt: "2025-01-11T11:20:00.000Z",
  },
  {
    id: "usr_006",
    name: "Margaret Hamilton",
    email: "margaret@example.com",
    role: "admin",
    createdAt: "2025-04-29T16:05:00.000Z",
  },
];

const products = [
  {
    id: "prd_001",
    name: "Mechanical Keyboard",
    description: "Hot-swappable 75% keyboard with tactile switches",
    price: 149.99,
    category: "peripherals",
  },
  {
    id: "prd_002",
    name: "Ultrawide Monitor",
    description: "34-inch curved display, 144Hz",
    price: 699.0,
    category: "displays",
  },
  {
    id: "prd_003",
    name: "USB-C Dock",
    description: "11-in-1 dock with dual HDMI and gigabit ethernet",
    price: 189.5,
    category: "accessories",
  },
  {
    id: "prd_004",
    name: "Noise Cancelling Headphones",
    description: "Over-ear, 30-hour battery, multipoint pairing",
    price: 279.0,
    category: "audio",
  },
  {
    id: "prd_005",
    name: "Standing Desk",
    description: "Electric sit-stand desk, 120kg capacity",
    price: 549.99,
    category: "furniture",
  },
  {
    id: "prd_006",
    name: "Laptop Stand",
    description: "Adjustable aluminium stand, folds flat",
    price: 39.95,
    category: "accessories",
  },
  {
    id: "prd_007",
    name: "Webcam 4K",
    description: "Ultra-low-light 4K webcam with dual microphones",
    price: 219.0,
    category: "peripherals",
  },
  {
    id: "prd_008",
    name: "Ergonomic Chair",
    description: "Mesh back, adjustable lumbar, 5-year warranty",
    price: 899.99,
    category: "furniture",
  },
];

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "downstream-api" });
});

function paginate(items, query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const pageSize = Math.max(parseInt(query.pageSize, 10) || 50, 1);
  const start = (page - 1) * pageSize;

  return {
    slice: items.slice(start, start + pageSize),
    meta: { total: items.length, page, pageSize },
  };
}

app.get("/users", (req, res) => {
  const { slice, meta } = paginate(users, req.query);
  res.json({ success: true, data: slice, meta });
});

app.get("/users/:id", (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

app.get("/products", (req, res) => {
  const { slice, meta } = paginate(products, req.query);
  res.json({ success: true, data: slice, meta });
});

app.get("/products/:id", (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(product);
});

app.listen(PORT, () => {
  console.log(`Downstream API running on http://localhost:${PORT}`);
});
