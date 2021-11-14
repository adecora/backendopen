require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
const Person = require("./models/person");

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


app.get("/api/persons", (request, response) => {
    Person.find({}).then((persons) => {
        response.json(persons);
    });
});

app.get("/info", (request, response) => {
    Person.find({}).then((persons) => {
        response.send(`<p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>`);
    });
});

app.get("/api/persons/:id", (request, response, next) => {
    Person.findById(request.params.id)
        .then((person) => {
            if (person) {
                response.json(person);
            } else {
                response.status(404).end();
            }
        })
        .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then((result) => {
            response.status(204).end();
        })
        .catch((error) => next(error));
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

    Person.find({}).then((persons) => {
        const names = persons.map((p) => p.name.toLowerCase());

        if (names.includes(name.toLowerCase())) {
            return response.status(400).json({
                error: "name must be unique",
            });
        }

        const person = new Person({
            name: name,
            number: number,
        });

        person.save().then((savedPerson) => {
            response.json(savedPerson);
        });
    });
});

app.put("/api/persons/:id", (request, response, next) => {
    const { name, number } = request.body;

    const person = { name, number };

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then((updatedPerson) => {
            if (updatedPerson) {
                response.json(updatedPerson);
            } else {
                response.status(404).end();
            }
        })
        .catch((error) => next(error));
});

const errorHandling = (error, request, response, next) => {
    console.log(error.message);

    if (error.name === "CastError") {
        response.status(400).send({ error: "malformatted id" });
    }

    next(error);
};

app.use(errorHandling);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server listen on port ${PORT}`);
});
