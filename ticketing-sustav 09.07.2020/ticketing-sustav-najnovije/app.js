const Koa = require("koa");
const KoaRouter = require("koa-router");
const KoaStatic = require("koa-static");
const bodyParser = require("koa-bodyparser");
const json = require("koa-json");
const render = require("koa-ejs");
const path = require("path");
const mongoose = require("mongoose");

const { user, ticket } = require("./schema");

const app = new Koa();
const router = new KoaRouter();

// DB Connection
mongoose.connect(
  "mongodb://127.0.0.1:27017/ticketing-sustav",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Greška pri spajanju na DB:"));
db.once("open", function () {
  console.log("DB Spojen!");

  const ticketModel = mongoose.model("ticket", ticket);

  router.get("/", async (ctx) => {
    const tickets = await ticketModel.find((err, res) => {
      return res;
    });
    await ctx.render("index", {
      tickets,
    });
  });

  router.get("/login", async (ctx) => {
    await ctx.render("login");
  });

  router.get("/new", async (ctx) => {
    await ctx.render("new");
  });

  router.get("/all", async (ctx) => {
    const tickets = await ticketModel.find((err, res) => {
      return res;
    });
    await ctx.render("all", {
      tickets,
    });
  });

  router.get("/ticket/:id", async (ctx) => {
    const id = ctx.params.id;
    const ticket = await ticketModel.findById(id, (err, res) => {
      return res;
    });
    await ctx.render("ticket", {
      ticket,
    });
  });

  router.post("/add", async (ctx) => {
    const { title, subject } = ctx.request.body;
    const data = await ticketModel.create({
      title,
      subject,
      status: "Otvoren",
      dateOfCreation: new Date(),
      dateOfClosure: null,
    });
    console.log(`Kreiran novi ticket! \n ${data}`);
    ctx.redirect("/");
  });

  router.delete("/ticket/:id", async (ctx) => {
    const data = await ticketModel.findByIdAndDelete(ctx.params.id);
    console.log(`Izbrisan ticket! \n ${data}`);
    ctx.body = { success: true };
    ctx.redirect("/");
  });

  router.post("/modify/:id", async (ctx) => {
    const { title, subject, resolvedReason } = ctx.request.body;
    const id = ctx.params.id;
    await ticketModel.findByIdAndUpdate(
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
    console.log(status);
    const id = ctx.params.id;
    const data = await ticketModel.findByIdAndUpdate(
      id,
      { status },
      (err, res) => {
        return res;
      }
    );
    console.log(data);
    ctx.redirect("/");
  });
});

// Middlewares
app.use(json());
app.use(bodyParser());
app.use(KoaStatic(path.join(__dirname, "style")));

render(app, {
  root: path.join(__dirname, "views"),
  layout: "layout",
  viewExt: "html",
  cache: false,
  debug: false,
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => console.log("Ticketing sustav API pokrenut!"));
