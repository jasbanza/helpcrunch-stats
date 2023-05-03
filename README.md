# helpcrunch-stats

git clone this repo

Install dependancies:
```bash
$ npm install
```

copy and rename ```./config-template.js``` to ```./config.js``` 

In the ```./config.js``` file, set the following:
- HelpCrunch's ```API_KEY```
- number of ```DAYS_TO_QUERY```

In the ```./tags.js``` file:
- Get the array of tags from the HTTP response from HelpCrunch. You can get this by inspecting the HelpCrunch page with your browser's dev tools and filtering with "tag"

Run the script:
```bash
$ npm start
```
