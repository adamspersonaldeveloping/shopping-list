const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 42069
require('dotenv').config()


let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'shopping-list'

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })
    
app.set('view engine', 'ejs')
app.use(express.static('public'))
//body parser
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


app.get('/',async (request, response)=>{
    const shoppingItems = await db.collection('shoppings').find().toArray()
    const itemsLeft = await db.collection('shoppings').countDocuments({completed: false})
    response.render('index.ejs', { items: shoppingItems, left: itemsLeft })
    // db.collection('shoppings').find().toArray()
    // .then(data => {
    //     db.collection('shoppings').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error))
})

app.post('/addItem', (request, response) => {
    db.collection('shoppings').insertOne({shoppingItem: request.body.shopItem, completed: false})
    .then(result => {
        console.log('item added')
        response.redirect('/')
    })
    .catch(error => console.error(error))
})

app.put('/markComplete', (request, response) => {
    db.collection('shoppings').updateOne({shoppingItem: request.body.itemFromJS},{
        $set: {
            completed: true
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

app.put('/markUnComplete', (request, response) => {
    db.collection('shoppings').updateOne({shoppingItem: request.body.itemFromJS},{
        $set: {
            completed: false
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked UnComplete')
        response.json('Marked UnComplete')
    })
    .catch(error => console.error(error))

})

app.delete('/deleteItem', (request, response) => {
    db.collection('shoppings').deleteOne({shoppingItem: request.body.itemFromJS})
    .then(result => {
        console.log('Item Deleted')
        response.json('Item Deleted')
    })
    .catch(error => console.error(error))

})

app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})