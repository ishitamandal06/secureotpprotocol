const http = require("http");
const requestListener = function (req, res) {
  res.writeHead(200);
  res.end("This is the phone server");

  if (req.method === "POST") {
    let body = [];
    req
      .on("data", (data) => {
        // data is a buffer
        body.push(data);
      })
      .on("end", () => {
        body = Buffer.concat(body).toString();
        otp = JSON.parse(body)["otp"];
        console.log(otp);
        res.write(body);
        res.end();
      });
  }
};

const server = http.createServer(requestListener);
server.listen(8080);
console.log("Server running at http://localhost:8080/");
