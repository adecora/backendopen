const express = require("express");
const app = express();

const PORT = 3001;

app.get("/", (request, response) => {
    response.send("<h1>Hello world from express</h1>");
})

app.listen(PORT, () => {
    console.log(`Server listen on port ${PORT}`);
})