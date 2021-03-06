const express = require('express')
const routes = require('./controllers/routes.js')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const path = require('path')
// const fetch = require('node-fetch')

/**
 * Server
 * @Class
 */
class Server {
  constructor () {
    this.app = express()
    this.port = 3000
  }

  // fecthArticle () {
  //   const article = fetch('http://localhost:3000/article/list/')
  //     .then(response => response.json())
  //     .then(data => {
  //       return data
  //     })
  //   return article
  // }

  // showArtice (id) {
  //   const article = fetch(`http://localhost:3000/article/show/${id}`)
  //     .then(response => response.json())
  //     .then(data => {
  //       return data
  //     })
  //   return article
  // }

  /**
   * db connect
   * @return {Object} connect
   */
  dbConnect () {
    const host = 'mongodb://localhost:27017/worker_genius'
    const connect = mongoose.createConnection(host, { 
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    })
  
    connect.on('error', (err) => {
      setTimeout(() => {
        console.log('[ERROR] api dbConnect() -> mongodb error')
        this.connect = this.dbConnect(host)
      }, 5000)
  
      console.error(`[ERROR] api dbConnect() -> ${err}`)
    })
  
    connect.on('disconnected', () => {
      setTimeout(() => {
        console.log('[DISCONNECTED] api dbConnect() -> mongodb disconnected')
        this.connect = this.dbConnect(host)
      }, 5000)
    })
  
    process.on('SIGINT', () => {
      connect.close(() => {
        console.log('[API END PROCESS] api dbConnect() -> close mongodb connection ')
        process.exit(0)
      })
    })
    return connect
  }

  /**
   * middleware
   */
  middleware () {
    this.app.set('view engine', '.hbs')
    this.app.use('/public', express.static(path.join(__dirname, '../assets')))
    this.app.set('views', path.join(__dirname, '../views'))
    this.app.engine('.hbs', exphbs({
      helpers: {
        dateFormat: require('handlebars-dateformat')
      },
      extname: '.hbs',
      defaultLayout: 'main',
      layoutsDir: path.join(__dirname, '../views/layouts/'),
      partialsDir: path.join(__dirname, '../views/partials/')
    }))

    this.app.use(bodyParser.urlencoded({ 'extended': true }))
    this.app.use(bodyParser.json())

    this.app.get('/home', async (_, res) => {
      // const articles = await this.fecthArticle()
      const title = 'Bienvenue !'
      res.render('home', { title: title })
    })

    this.app.use(bodyParser.urlencoded({ 'extended': true }))
    this.app.use(bodyParser.json())
  }

  /**
   * routes
   */
  routes () {
    // Users
    // new routes.users.Create(this.app, this.connect)
    // new routes.users.Show(this.app, this.connect)
    // new routes.users.Update(this.app, this.connect)
    // new routes.users.Delete(this.app, this.connect)

    // certifications
    new routes.certifications.NewCertification(this.app, this.connect)
    new routes.certifications.ShowCertification(this.app, this.connect)
    new routes.certifications.EditCertification(this.app, this.connect)
    // new routes.certifications.DeleteCertification(this.app, this.connect)
    // new routes.certifications.ListCertification(this.app, this.connect)

    this.app.use((_, res) => {
      res.status(404).json({
        'code': 404,
        'message': 'Not Found'
      })
    })
  }

  /**
   * run
   */
  run () {
    try {
      this.connect = this.dbConnect()
      this.dbConnect()
      this.middleware()
      this.routes()
      this.app.listen(this.port, () => console.log(`Server is listening on port ${this.port} and dirname is ${__dirname}`))
    } catch (err) {
      console.error(`[ERROR] Server -> ${err}`)
    }
  }
}

module.exports = Server
