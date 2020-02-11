const express = require('express');

let app = express();

app.get('/', (req, res) => {
    res.send('<h1>Hello World</h1>');
})

app.listen(3001, function() {
    console.log('Listening on port 3001...');
});