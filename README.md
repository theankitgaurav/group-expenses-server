# group-expenses
A simple web app to manage expenses

# Features
## General Features
+ Users can register themselves to manage personal expenses
+ Users can join shared groups to manage expenses within a group
+ Users can invite other people to join a group
+ Members can be notified of entries by other members through email or push notification
+ Entries from one member can't be modified by another
+ Past-dated entries/modifications in a group need to approved by at least one other member

# Todo
+ Make the number of days afte which entries will be freezed configurable on group level

# Build Setup

``` bash
# run application in debug mode (windows)
set DEBUG=http,mail,express:* & npm start 

```