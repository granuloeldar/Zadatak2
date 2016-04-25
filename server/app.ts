/// <reference path="../typings/main.d.ts" />
import * as express from 'express';

const app: express.Application = express();

app.use(express.static('./client'));
app.use(express.static('./client/assets/css'));
app.use(express.static('./client/assets/js'));

app.get('/', function (request: express.Request, response: express.Response) { 
    response.send('/client/index.html');
});

app.get('/api/hello', function (request: express.Request, response: express.Response) { 
    let dummy: string = '{"text": "dummy text", "text1" : "other text"}';
    response.send(JSON.parse(dummy).text + " " +  JSON.parse(dummy).text1);
});

app.listen(3000, () => {
    console.log('Server started at localhost:3000');
});