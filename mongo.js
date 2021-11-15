const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log(
    'Please provide the password, usage: node mongo.js <password> !<name> !<phone>'
  )
  console.log('(! optional parameters)')
  process.exit(1)
}

const [ , , password, name, phone] = process.argv

const url = `mongodb+srv://fullstack:${password}@cluster0.wqe6f.mongodb.net/phonebook-app?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (name && phone) {
  const person = new Person({
    name: name,
    number: phone,
  })

  person.save().then(({ name, number }) => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
} else {
  Person.find({}).then((persons) => {
    for (let person of persons) {
      console.log(person)
    }
    mongoose.connection.close()
  })
}
