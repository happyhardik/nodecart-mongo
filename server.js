const http = require("http");

function reqHandler(req, res) {
    console.log(req.url, req.method);
    const url = req.url;
    const method = req.method;
    if(url === "/") {
        res.write('<html><body><h1>My form</h1>');
        res.write('<form action="/create-user" method="post"><input type="text" name="username" placeholder="Enter username" /><input type="submit" value="Post" />')
        res.write('</body></html>');
        return res.end();
    }
    if(url === "/users") {
        res.write('<html><body><h1>List of Users here</h1>');
        res.write('<ul><li>User1</li><li>User2</li></ul>')
        res.write('</body></html>');
        return res.end();
    }
    if(url === "/create-user" && method ==="POST") {
        const body = [];
        req.on("data", (chunk) => {
            console.log(chunk);
            console.log(`Chunk: ${chunk}`);
            body.push(chunk);
        });
        return req.on("end", () => {
            const parsedBody = Buffer.concat(body).toString();
            const username = parsedBody.split("=")[1];
            console.log(`User name: ${username}`);
            res.statusCode = 302;
            res.setHeader("Location","/");
            return res.end();
        });
    }
    res.write("<h1>No donuts for you!</h1>");
    res.end();
}
const server = http.createServer(reqHandler);
server.listen(3000);
