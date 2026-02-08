import app from "./app.js";
import { PORT } from "./constants.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config();

connectDB();

app.listen(PORT, () => {
    console.log(`listening at port: ${PORT}`);
});
