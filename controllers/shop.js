// Importing required modules and packages
const Product = require("../models/product");
const Order = require("../models/order");
const stripe = require("stripe")(
  "sk_test_51NLTsUC1qXAVEzqRECAv8wSz7BDhfaseCbDeHO5Cl7Ds9ZcXCV6mnhqdETYJBGpsHgEhUT1cANkP1SwgnBoeZaTt00WWl7rtxw"
);

// Route handler for displaying all products in the shop
exports.getProducts = (req, res, next) => {
  // Define variables to store filtered products
  let manga, figures;
  // Fetch all products from the database
  Product.find()
    .then((products) => {
      manga = products.filter((prod) => prod.category === "manga");
      figures = products.filter((prod) => prod.category === "figures");
      // Render the 'shop/merch' template and pass the fetched products and filtered categories to it
      res.render("shop/merch", {
        prods: products,
        manga: manga,
        figures: figures,
        pageTitle: "All Products",
        path: "/products",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("An error occurred while fetching products.");
    });
};

// Route handler for displaying a specific product's details
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  // Find the product in the database by its ID
  Product.findById(prodId)
    .then((product) => {
      // Render the 'shop/product-detail' template and pass the fetched product to it
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

// Route handler for displaying the shop's main page
exports.getIndex = (req, res, next) => {
  // Fetch all products from the database
  Product.find()
    .then((products) => {
      const Prodlist = []
      if (products.length > 0) {
        let i=0
        while (i<3) {
          Prodlist.push(products[Math.floor(Math.random()*products.length)])
          i++
        }
      }
      // Render the 'shop/index' template and pass the fetched products to it
      res.render("shop/index", {
        prods: Prodlist,
        pageTitle: "Shop",
        path: "/",
        isAuthenticated: req.session ? req.session.isLoggedIn : false,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("An error occurred while fetching products.");
    });
};

// Route handler for displaying the user's cart
exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;
      // Render the 'shop/cart' template and pass the fetched cart items to it
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

// Route handler for adding a product to the cart
exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  // Find the product in the database by its ID and add it to the user's cart
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    });
};

// Route handler for removing a product from the cart
exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  // Remove the product with the given ID from the user's cart
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

// Route handler for creating an order
exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          name: req.user.name,
          userId: req.user,
        },
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => console.log(err));
};

// Route handler for displaying the user's orders
exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      console.log(orders.length);
      // Render the 'shop/orders' template and pass the fetched orders to it
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

// Route handler for displaying the checkout page and handling the payment
exports.getCheckout = (req, res, next) => {
  let products;
  let totalPrice = 0;

  req.user
    .populate("cart.items.productId")
    .then((user) => {
      console.log(user);
      products = user.cart.items;
      totalPrice = 0;
      products.forEach((product) => {
        totalPrice += product.quantity * product.productId.price;
      });

      // Create a Stripe checkout session and render the 'shop/checkout' template
      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: products.map((p) => {
          return {
            quantity: p.quantity,
            price_data: {
              currency: "eur",
              unit_amount: p.productId.price * 100,
              product_data: {
                name: p.productId.title,
                description: p.productId.description,
              },
            },
          };
        }),
        customer_email: req.user.email,
        success_url:
          req.protocol + "://" + req.get("host") + "/checkout/success",
        cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
      });
    })
    .then((session) => {
      // Render the 'shop/checkout' template and pass the session ID and total price to it
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: products,
        sessionId: session.id,
        totalSum: totalPrice,
        // isAuthenticated: req.isLoggedIn,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.error(err));
};
