const Koa = require("koa");
const KoaRouter = require("koa-router");
const KoaStatic = require("koa-static");
const KoaSession = require("koa-session");
const passport = require("koa-passport");
const bodyParser = require("koa-bodyparser");
const json = require("koa-json");
const render = require("koa-ejs");
const path = require("path");
const mongoose = require("mongoose");
const moment = require("moment");

const { User, Ticket } = require("./schema");

const app = new Koa();
const router = new KoaRouter();

// Passport config
require("./config/passport")(passport);

// Middlewares
app.keys = ["secret"];
app.use(json());
app.use(bodyParser());
app.use(KoaSession({}, app));
app.use(KoaStatic(path.join(__dirname, "style")));
app.use(passport.initialize());
app.use(passport.session());

// DB Connection
mongoose
  .connect(
    "mongodb://localhost:27017/ticketing-sustav",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("DB Spojen!"))
  .catch(() => console.error.bind(console, "Greška pri spajanju na DB:"));

router.get("/", async (ctx) => {
  if (ctx.isAuthenticated()) {
    // return next();
    const tickets = await Ticket.find((err, res) => {
      return res;
    });
    await ctx.render("index", {
      tickets,
      user: ctx.state.user,
      isLogin: false,
    });
  } else {
    ctx.redirect("/login");
  }
});

router.get("/login", async (ctx) => {
  if (!ctx.isAuthenticated()) {
    await ctx.render("login", {
      user: ctx.state.user,
      isLogin: true,
    });
  } else {
    ctx.redirect("/");
  }
});

router.get("/new", async (ctx) => {
  if (ctx.isAuthenticated()) {
    await ctx.render("new", {
      user: ctx.state.user,
      isLogin: false,
    });
  } else {
    ctx.redirect("/login");
  }
});

router.get("/all", async (ctx) => {
  if (ctx.isAuthenticated()) {
    if (ctx.state.user.role === "admin") {
      const tickets = await Ticket.find((err, res) => {
        return res;
      });
      await ctx.render("all", {
        tickets,
        user: ctx.state.user,
        moment,
        isLogin: false,
      });
    } else {
      ctx.redirect("/");
    }
  } else {
    ctx.redirect("/login");
  }
});

router.get("/ticket/:id", async (ctx) => {
  const id = ctx.params.id;
  const referrer = ctx.query.referrer ? ctx.query.referrer : null;
  const ticket = await Ticket.findById(id, (err, res) => {
    return res;
  });
  await ctx.render("ticket", {
    ticket,
    referrer,
    isLogin: false,
  });
});

router.post("/login", async (ctx) => {
  return passport.authenticate("local", (err, user, info, status) => {
    if (!user) {
      ctx.status = 401;
      ctx.body = info;
    } else {
      ctx.login(user).then(() => {
        console.log("User:", user.username, "logged in.");
        ctx.login(user);
        console.log(ctx.state.user);
        ctx.redirect("/");
      });
    }
    console.log(err, user, info, status);
  })(ctx);
});

router.get("/logout", async (ctx) => {
  ctx.logout();
  ctx.redirect("/login");
});

router.post("/add", async (ctx) => {
	console.log(ctx.request.body);
  const { title, subject, resolvedReason } = ctx.request.body;
  const user = ctx.state.user;
  const data = await Ticket.create({
    title,
    subject,
    user,
	resolvedReason,
    status: "Otvoren",
    dateOfCreation: new Date(),
    closeDate: null,
  });
  console.log(`Kreiran novi ticket! \n ${data}`);
  ctx.redirect("/");
});

router.delete("/ticket/:id", async (ctx) => {
  const data = await Ticket.findByIdAndDelete(ctx.params.id);
  console.log(`Izbrisan ticket! \n ${data}`);
  ctx.body = { success: true };
  ctx.redirect("/");
});

router.post("/modify/:id", async (ctx) => {
  const { title, subject, resolvedReason } = ctx.request.body;
  const id = ctx.params.id;
  await Ticket.findByIdAndUpdate(
    id,
    { title, subject, resolvedReason },
    (err, res) => {
      return res;
    }
  );
  ctx.redirect("/");
});

router.post("/status/:id", async (ctx) => {
  const status = ctx.query.status;
  const closeDate = status === "Zatvoren" ? new Date() : null;
  const reviewer = ctx.state.user;
  console.log(status);
  const id = ctx.params.id;
  const data = await Ticket.findByIdAndUpdate(
    id,
    { status, closeDate, reviewer },
    (err, res) => {
      console.log(err);
      console.log(res);
      return res;
    }
  );
  ctx.redirect("/");
});

render(app, {
  root: path.join(__dirname, "views"),
  layout: "layout",
  viewExt: "html",
  cache: false,
  debug: false,
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => console.log("Ticketing sustav API pokrenut!"));
