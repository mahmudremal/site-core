here i want to cretae a server with nodejs and an browser extention that will act like below

when i visit web.whastapp.com and i open a contact or channel and open channel or contact info sidebar, it'll send some fields will be added by custom by this extention. one for bot type and another for prompt.

when i open an contact or chat or channel it will send an event triggiring I opened this channel. so my server will send a dummy content to the extention and extention will show that text just above the typing section.

the server application will have a database with custom table. where it store varius channel prompt with bot type.

when i start typing extention will send an even to server. when i blur the typing input, extention will send an event to server. when i close an contact or chat it will send an event to server.

you get the point? you'll get rest of idea form code. so help me finalize and refine and upgrade the code. both server.js and extention file