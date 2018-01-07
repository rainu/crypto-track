# Crypto-Track

Track all crypto currencies and show the composition of your portfolio.

# Progress

**ALPHA**

# Config

Each configuration can set over the environment variables. For example: if we want to set
the **server.port**, we have to define a environment variable named **CFG_SERVER_PORT**. So the
environment variable starts with **CFG_** followed by the "config_path". Where the config path
is UPPER-Case and each dot (.) have to be replaced with underscore (_).

## Mini-doc

**/build/** - Contains files needed for build and hot development  
**/build/index_dev.html** - Template for index.html  
**/client/** - Vue.js app source  
**/config/** - Configuration files  
**/public/** - Public folder served by express
**/server/** - Server side logic  

License
-------

This project is distributed under the [MIT-License](http://www.opensource.org/licenses/mit-license.php).