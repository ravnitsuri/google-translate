const express = require("express");
const Router = express.Router;

const chalk = require("chalk");
// const translate = require("google-translate-api");
const translate = require("@vitalets/google-translate-api");

const limiter = require("limiter");
const RateLimiter = limiter.RateLimiter;
const limited = new RateLimiter({ tokensPerInterval: 1, interval: 200 });

const app = express();

let defaultRouter = Router();
defaultRouter.post("/", async (req, res, next) => {
  try {
    let inputObj = req.body;

    let allInputKeys = Object.keys(inputObj);
    let outputObj = {};
    for (const [index, value] of allInputKeys.entries()) {
      let response = await translate(inputObj[value], { from: "en", to: "no" });
      await limited.removeTokens(1);
      outputObj[value] = response.text;
      console.log({ index: `${index + 1} of ${allInputKeys.length}`, key: value, input: inputObj[value], output: response.text });
    }

    res.send({ payload: outputObj });
  } catch (error) {
    console.log({ error });

    res.send(error);
  }
});

app.use(express.json());
app.use("/", defaultRouter);

app.listen(5000, () => {
  console.log(chalk.black.bgYellow(`\n\n🚀  Server running at `) + "\n" + chalk.red("====> ") + chalk.green(`http://localhost:${5000}`) + "\n");
});
