require('dotenv').config();
const cookieParser = require('cookie-parser');
const express = require('express');
const helmet = require('helmet');
const httpErrors = require('http-errors');
const logger = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const activityRouter = require('./routes/activity');
//var express = require('express');




const app = express();
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'frame-ancestors': ["'self'", `https://mc.${process.env.STACK}.exacttarget.com`, `https://jbinteractions.${process.env.STACK}.marketingcloudapps.com`],
      },
    },
  }),
);
//send message to slack
var port = process.env.PORT || 8080;
const { createServer } = require('http');
var slack = require('slack');
var slacktoken = process.env.SLACK_URL;
const { InstallProvider } = require('@slack/oauth');

const { WebClient, LogLevel } = require("@slack/web-api");
const client = new WebClient(slacktoken, {
  logLevel: LogLevel.DEBUG
});
try {
     const result = client.chat.postMessage({
     token:slacktoken ,
     channel:process.env.channel ,
     text:" Journey is activated on "
     });          
   console.log(result);
  
  
 }
 catch (error)
 {
console.error(error);
 }
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.raw({
  type: 'application/jwt',
}));

app.use(express.static(path.join(__dirname, 'public')));

// serve config
app.use('/config.json', routes.config);

// custom activity routes
app.use('/journey/execute/', activityRouter.execute);
app.use('/journey/save/', activityRouter.save);
app.use('/journey/publish/', activityRouter.publish);
app.use('/journey/validate/', activityRouter.validate);

// serve UI
app.use('/', routes.ui);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(httpErrors(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
