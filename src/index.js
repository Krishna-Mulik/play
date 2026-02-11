import "./config.js";
import app from "./app.js";
import connectDB from "./db/index.js";
import { PORT } from "./constants.js";

connectDB();

app.listen(PORT, () => {
    console.log(`listening at port: ${PORT}`);
});
