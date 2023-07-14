const https = require("https");
const CryptoJS = require("crypto-js");

const express = require("express");
const app = express();
const cors = require("cors");

const fs = require("fs");
const axios = require("axios");
const bodyParser = require("body-parser");
const {response} = require("express");

const otp_dict = {};

const options = {
	key: fs.readFileSync("self-signed certificate/server.key"),
	cert: fs.readFileSync("self-signed certificate/server.crt"),
};

app.use(cors());

const server = https.createServer(options, app);

app.use((req, res, next) => {
	var headers = {
		"Access-Control-Allow-Methods": "GET, POST",
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Max-Age": 2592000,
	};

	if (req.method === "POST") {
		let body = [];
		req
			.on("data", (data) => {
				// data is a buffer
				body.push(data);
			})
			.on("end", () => {
				body = JSON.parse(Buffer.concat(body).toString());
				if (body["type"] == "OTP_REQUEST") {
					var otp = Math.floor(100000 + Math.random() * 900000);
					console.log(otp);
					otp_dict[body["username"]] = {
						otp: otp.toString(),
						URL: body["URL"],
					};
					console.log(otp_dict);
					axios
						.post("http://localhost:8080/", {
							otp: otp,
						})
						.catch((error) => {
							console.error(error);
						});
					res.writeHead(200, headers);
					res.end();
				} else if (body["type"] == "OTP_SUBMIT") {
					if (otp_dict[body["username"]] != undefined) {
						const message =
							otp_dict[body["username"]]["URL"] + body["username"];
						var key = CryptoJS.PBKDF2(
							otp_dict[body["username"]]["otp"],
							"158174",
							{
								keySize: 256 / 32,
								iterations: 1000,
							}
						);
						var hash = CryptoJS.HmacSHA256(message, key);
						if (hash["words"].toString() == body["hash"]) {
							console.log("Verified");
							res.writeHead(200, headers);
							var return_hash = CryptoJS.HmacSHA256(body["URL"], key);
							res.end(return_hash["words"].toString());
						} else {
							res.writeHead(204, headers);
							console.log("WRONG!!!");
							res.end();
						}
					} else {
						res.writeHead(204, headers);
						console.log("WRONG!!!");
						res.end();
					}
				} else if (body["type"] == "PASSWORD_SUBMIT") {
					if (
						otp_dict[body["username"]] != undefined &&
						body["password"] == "Ishita123"
					) {
						console.log("LOG IN SUCCESSFUL");
						res.writeHead(200, headers);
						res.end();
					} else {
						console.log("WRONG!!!");
						res.writeHead(204, headers);
						res.end();
					}
				}
			});
	} else {
		res.end("This is a secure server\n");
	}
	next();
});

server.listen(443);

server.use;

console.log("Server running on https://localhost:443");
