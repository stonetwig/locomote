# Flight search
A code task for a company named Locomote (to show my skills).

## Instructions
All the instructions are available in the instructions.html document.

## Authors notes
Obvious improvements could be to create better error handling, use a templating library like Handlebars or something (was trying to keep the use of third party libraries to the minimum).
Another thing could be to let the user pick between airports if there are several in once city.

## Installation
Either run the bash.sh OR do the following (node is a req for both).
When in root folder, do the following:
```
cd server
npm install
```

To run on MacOS/Linux (when in the server directory):
```DEBUG=myapp:* npm start```

To run on Windows (when in the server directory):
```set DEBUG=myapp:* & npm start```

When you have started the node application, simply run the public/index.html in your browser of choice and start searching for flights!
