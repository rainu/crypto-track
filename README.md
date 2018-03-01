# Crypto-Track

Track all crypto currencies and show the composition of your portfolio. In additional it generates
a "tax-report". This is a list of tax-related trades (with the FIFO-Method)

# Progress

**ALPHA**

# HowTo start

Currently there is no GUI for adding a user or trades. You have to write the json-backup file for
your own and upload it (for example via curl) to the server (endpoint: **PUT /api/backup/**).

The json structure can be read in [import/backup.js](/server/web/src/import/backup.js)

# HowTo setup

* build the sources
```
npm run build
```
* start a mongodb instance, i use docker for doing this:
```
docker run --rm --name mongo-db -p 27017:27017 mongo
```
* start the course-crawler to save historical courses of the currencies
```
npm run course
```
* start the web-server
```
npm run web
```

Or use docker-compose to setup the finished system:
```
docker-compose up
```

# Config

Each configuration can set over the environment variables. For example: if we want to set
the **server.port**, we have to define a environment variable named **CFG_SERVER_PORT**. So the
environment variable starts with **CFG_** followed by the "config_path". Where the config path
is UPPER-Case and each dot (.) have to be replaced with underscore (_).

## Mini-doc

**/build/** - Contains files needed for build and hot development  
**/build/index_dev.html** - Template for index.html  
**/client/** - Frontend - Vue.js app source
**/config/** - Configuration files  
**/public/** - Public folder served by express
**/server/** - Server side logic  
**/server/web** - WebServer for the frontend
**/server/course** - Course-Crawler
**/server/watch** - Wallet-Watcher


License
-------

This project is distributed under the [MIT-License](http://www.opensource.org/licenses/mit-license.php).