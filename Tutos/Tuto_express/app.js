const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/', (req, res) => {
    res.json({
        firstName: 'John',
        lastName: 'Doe'
    }, 201)
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})