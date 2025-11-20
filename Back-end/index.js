const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
app.use(cors()); 

const swaggerUi = require('swagger-ui-express');
const option = require("./swagger");
const swaggerJSDoc = require("swagger-jsdoc");

require('dotenv').config();

const connectDB = require('./database');
// const Music = require('./Model/MusicSchema');
// const User = require('./Model/UserSchema');

const userRouter = require('./Router/UserRouter');
const musicRouter = require('./Router/MusicRouter');

const specs = swaggerJSDoc(option);
app.set("trust proxy", 1);
app.get("/openapi.json", (req, res) => {
  const host = req.get("host");
  const proto = req.get("x-forwarded-proto") || req.protocol;
  const dynamic = { ...specs, servers: [{ url: `${proto}://${host}` }] };
  res.json(dynamic);
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);

connectDB();

app.use(express.json());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});


app.use('/api/music', musicRouter);
app.use('/api/user', userRouter); 

app.use(cors({
  origin: [
    'https://moody-blue-597542124573.asia-southeast2.run.app',
    'https://mymusic.vercel.app',
    'https://mymusic.netlify.app',
    'https://mymusic.com',
    'http://localhost:3000', 
    'http://localhost:8080'
  ],
  credentials: true
}));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});