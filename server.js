const express = require('express')

const app = express()

const PORT = process.env.PORT || 5000

app.get('/', (req, res) => {
    res.send('Testing')
})

app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`)
})