# Description
This is a Mongo, Express, React, Node (MERN) test of the classic ToDo App utilizing Server Sent Events (SSE) to show reactivity. So no matter who opens the page, everyone should be synchronized in what they see. As they change the items in the list, everyone will see the change. 

# Project Setup
* Clone the repo
* Install node resources
* Create settings.json in the root directory
* Execute with: npm run all

# MongoDB Setup
In order for this project to work, it utilizes mongoose.model.watch() which requires replication logs to be generated. In order to do that, your MongoDB instance must be set up as a Replication Set. To do this manually, you must alter the mongod.conf file to include the following:
```
replication:
    replSetName: "<enter-name-here>"
```
Then you need to enter into the mongod interface as an administrator and execute:
> rs.initiate()

If you have enabled security features, you also need to generate a keyfile that is shared between each node in the replication set:
> openssl rand -base64 756 > PATH-TO-KEYFILE

> chmod 400 PATH-TO-KEYFILE

You can then change your security settings to point to the keyfile:
```
security:
    authorization: "enabled"
    keyFile: PATH-TO-KEYFILE
```
And finally, the rs.initiate() will create settings for the Replication Set based on information it can see. If you set up MongoDB in a container like me, the name (which is what it expects its connection strings to be) was randomized (not the address I use to connect to it). So I had to alter the name using the following commands as an admin:
> cfg = rs.conf()

> cfg.members[#].name = "ENTER-PUBLIC-ADDRESS"

> rs.reconfig(cfg)

# settings.json
```
{
    "mongostring": "mongodb://username:password@server-address/database"
}
```