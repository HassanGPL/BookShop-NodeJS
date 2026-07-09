const http = require('http');

const server = http.createServer((req, res) => {
    console.log(req.url, req.method, req.headers);
    res.write('<html>')
    res.write('<head><title>First Page</title></head>')
    res.write('<body><h1>Hello From My NodeJS Server</h1></body>')
    res.write('</html>')
    res.end()
});

server.listen(3000);