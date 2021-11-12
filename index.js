const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();

app.use(cors());
app.use(express.static("build"));
app.use(express.json());

morgan.token("body", function getRequestBody(req, res) {
    return JSON.stringify(req.body);
});

const requestLogger = (tokens, req, res) => {
    const method = tokens.method(req, res);
    let log = [
        method,
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, "content-length"),
        "-",
        tokens["response-time"](req, res),
        "ms",
    ];

    return method === "POST"
        ? [...log, tokens.body(req, res)].join(" ")
        : log.join(" ");
};

app.use(morgan(requestLogger));


let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456",
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523",
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345",
    },
    {
        id: 4,
        name: "Mary Poppendieck",
        number: "39-23-6423122",
    },
];

const generateId = () => {
    return Math.floor(Math.random() * 1_000_000);
};

app.get("/", (request, response) => {
    response.send("<h1>Phonebook REST API</h1>");
});

app.get("/api/persons", (request, response) => {
    response.json(persons);
});

app.get("/info", (request, response) => {
    response.send(`<p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>`);
});

app.get("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id);
    const person = persons.find((p) => p.id === id);

    if (person) {
        response.json(person);
    } else {
        response.status(404).end();
    }
});

app.delete("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id);
    persons = persons.filter((p) => p.id !== id);

    response.status(204).end();
});

app.post("/api/persons", (request, response) => {
    const { name, number } = request.body;

    if (!name || !number) {
        response.status(400);
        const missing =
            !name && !number ? "name and number" : !name ? "name" : "number";
        return response.json({
            error: `${missing} missing`,
        });
    }

    const names = persons.map((p) => p.name.toLowerCase());

    if (names.includes(name.toLowerCase())) {
        return response.status(400).json({
            error: "name must be unique",
        });
    }

    const person = {
        name: name,
        number: number,
        id: generateId(),
    };

    persons = persons.concat(person);

    response.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listen on port ${PORT}`);
});