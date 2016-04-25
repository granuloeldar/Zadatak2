import * as express from 'express';

var app = express();

app.use(express.static('./client'));
app.use(express.static('./client/css'));
app.use(express.static('./client/js'));

app.listen(3000, function () {
    console.log('Server started at localhost:3000');
});