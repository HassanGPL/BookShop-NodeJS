const http = require('http');

const server = http.createServer((req, res) => {
    const url = req.url;
    if (url === '/') {
        res.write('<html>')
        res.write('<head><title>Message!</title></head>')
        res.write('<body>')
        res.write('<form action="/message" method="POST">')
        res.write('<input type="text" name="message"></input>')
        res.write('<button type="submit">Send</button>')
        res.write('</form>')
        res.write('</body>')
        res.write('</html>')
        return res.end()
    }
    res.write('<html>')
    res.write('<head><title>First Page</title></head>')
    res.write('<body><h1>Hello From My NodeJS Server!</h1></body>')
    res.write('</html>')
    res.end()
});

server.listen(3000);