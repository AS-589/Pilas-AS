const express = require("express")
const {connect} = require("mongoose")
require("dotenv").config()
const cors = require("cors")
const upload = require("express-fileupload")
const userRoutes = require('./routes/userRoutes')
const { notFound, errorHandler } = require("./middlewares/errorMiddleware")
const { server, app } = require("./socket/socket")

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'https://pilas-as.vercel.app'];


console.log('Allowed Origins:', allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      console.log('Request Origin:', origin); 
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.urlencoded({extended: true}))
app.use(express.json({extended: true}))
app.use(upload())


app.use('/api', userRoutes)


app.use(errorHandler);
app.use(notFound);


connect(process.env.MONGO_URL).then(server.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}`))).catch(err => console.log(err))

