# group-expenses
REST api to for the [Group Expenses PWA](https://github.com/ankitgaurav/pwa-client)

# Features
## General Features
+ Users can register themselves to manage personal expenses
+ Users can join shared groups to manage expenses within a group
+ Users can invite other people to join a group
+ Members can be notified of entries by other members through email or push notification
+ Entries from one member can't be modified by another
+ Past-dated entries/modifications in a group need to approved by at least one other member

# Build Setup
``` bash
# run application in debug mode (windows)
set DEBUG=router & npm start 

```

# Contribution Guide
1. Fork the repo and ```npm install``` all deps
2. Configure the environment variables (Or ask me for the same)
3. Make changes in a specific branch and request to pull into master
4. Please consider building once before submitting a PR

# Development Guide
- Changes in public APIs should always follow with a build and sanity test (Unit tests => My Salute)
- Use ES6 for succint code (Google Style Guide)
- Use of lodash, Joi etc is preferred over custom implementations