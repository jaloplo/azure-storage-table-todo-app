const fs = require('fs');
const express = require('express');

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.static(__dirname + '/static'));

app.engine('html', function(path, options, callback) {
    fs.readFile(path, (err, content) => {
        if(err) {
            return callback(err);
        }

        if(content) {
            return callback(null, content.toString());
        }
    });
});
app.set('views', './views');
app.set('view engine', 'html');

app.get('/', function(req, res) {
    res.render('landing');
});

app.listen(PORT, function() {
    console.log(`web server listening on port ${PORT}`);
});