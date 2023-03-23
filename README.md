This is sample of regular project based on Nest.js and Clean architecture.

Domain features that are implemented in this sample:
- real-time chat that is capable of receiving/sending system messages, private messages, SMS and emails
- integration with 3rd-party data provider
- resource access authorization (based on user role)
- content management
- integration with Twillio and Gmail services

Techniques: 
- Websockets
- OAuth
- Event-based architecture
- Dependency injection

Tools: 
- Nest.js
- TypeORM
- Socket.io

Architectural idea:
Each domain action is represented as separate class with its implementation. Each implementation wrapped into DB transaction out of box. Secondary functionality is separated from main by using in-process events. 