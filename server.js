const express = require("express");
const colors = require("colors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db");
const cors = require("cors");
const bodyParser = require("body-parser");
const cluster = require("cluster");
const os = require("os");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/api/v1/user", require("./routes/userRoutes.js"));
app.use("/api/v1/client", require("./routes/clientRoutes.js"));
app.use("/api/v1/tendor", require("./routes/tendorRoutes.js"));

const port = process.env.PORT || 5000;

// Check if we are in the master process
if (cluster.isMaster) {
    const numCPUs = os.cpus().length;
    console.log(`Master ${process.pid} is running`);

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
    });
} else {
    // Workers can share any TCP connection
    const server = app.listen(port, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`.bgCyan.white);
    });
}
