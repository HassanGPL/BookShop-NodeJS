const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    const url = req.url;
    const method = req.method;
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
    if (url === '/message' && method === 'POST') {
        const body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
        });
        req.on('end', () => {
            const parsedBody = Buffer.concat(body).toString();
            const message = parsedBody.split('=')[1];
            fs.writeFileSync('message.txt', message);
        });
        res.statusCode = 302;
        res.setHeader('Location', '/');
        return res.end();
    }
    res.write('<html>')
    res.write('<head><title>First Page</title></head>')
    res.write('<body><h1>Hello From My NodeJS Server!</h1></body>')
    res.write('</html>')
    res.end()
});

server.listen(3000);