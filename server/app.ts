import * as express from 'express';

var app = express();

app.use(express.static('./client'));
app.use(express.static('./client/css'));
app.use(express.static('./client/js'));

app.get('/api/hello', function (request, response) { 
    var dummy: string = '{"text": "dummy text"}';
    response.send(JSON.parse(dummy));
});

app.listen(3000, function () {
    console.log('Server started at localhost:3000');
});