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


## Features of a unit Expense (to be used synonymously with Entry)
+ Amount 
+ Quantity (Optional)
+ Category (The list of category)
+ Spent By (Current user by default)
+ Spent On (Date when the expense happened)
+ Remarks (Optional)
+ Divide Among (The list of members among whom the amount needs to be divided)


## DB Models Outline

# User
- id (pk)
- name
- email
- password
- status

# Group
- id (pk)
- name
- url
- status

# UserGroupMap
- id (pk)
- user (fk User.id)
- group (fk Group.id)

# Expense
- id (pk)
- category
- amount
- date
- payer (fk User.id)
- details
- group (fk Group.id)
- status

# Category
- id (pk)
- name
- group (fk Group.id)
- status
