# Description
This is a Mongo, Express, React, Node (MERN) test of the classic ToDo App utilizing Server Sent Events (SSE) to show reactivity. So no matter who opens the page, everyone should be synchronized in what they see. As they change the items in the list, everyone will see the change. 

# Setup
* Clone the repo
* Install node resources
* Create settings.json in the root directory
* Execute with: npm run all

# settings.json
{
    "mongostring": "mongodb://username:password@server-address/database"
}