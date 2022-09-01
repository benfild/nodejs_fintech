// * Modules Imports
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const compression = require('compression');
const morgan = require('morgan');

require('dotenv').config();
const app = express();

const { config } = require('./config/variables.config');


// * Helpers variables
const { upload } = require('./src/helpers/multer');
const { setHeaders, handleError } = require('./src/helpers/handler');;

// * set express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'assets')));

app.use(compression());
app.use(morgan('dev'));

//set headers
app.use(setHeaders);

// * ROUTES VARIABLES
const authRoutes = require('./src/routes/auth.route');
const userRoutes = require('./src/routes/user.route');
const studentRoutes = require('./src/routes/student.route');
const resultRoutes = require('./src/routes/result.route');

// * ROUTES API's
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/result', resultRoutes);

app.all('*', (req, res, next) => {
    res.json({
        message: 'Welcome to Results system!',
    });
});

// error handling for responses
app.use(handleError);

// import session and mongoDB store then create mongoDb store
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const store = new MongoDBStore({
    uri: config.db.url,
    collection: 'sessions'
});

// use session
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: store
}));


// connect to mongodb then start express server
mongoose.connect(config.db.url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(config.db.port, () => {
            console.log('Listening on port: ' + config.server.port);
        });
    }
    ).catch(err => {
        console.log(err);
    }
    );