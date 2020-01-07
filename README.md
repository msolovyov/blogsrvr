API app that takes uses a singular REST api resource and augments it to include multiple query parameters. Output is a graphql resource as well as a REST api

Source API:  /blog/posts
Method: ​GET 
Parameters: (required) The tag associated with the blog post

Returns json object:
{"posts"​: [{"id"​: ​1​,"author"​: ​"Rylee Paul"​,"authorId"​: ​9​,"likes"​: ​960​,"popularity"​: ​0.13​,"reads"​: ​50361​,"tags"​: [ ​"tech"​, ​"health" ​]},...]}

This apps api:
Route: ​/api/ping
Method: ​GET

Route: ​/api/posts
Method: ​GET

| Field  | Type  | Description  | Default  | Example    |
|---|---|---|---|-----|
|  tags | String(required)  | A comma separatedlist of tags.  |  N/A  | science,tech    |
|  sortBy | String(optional)  | The field to sort theposts by. Theacceptable fields are:●id●reads●likes●popularity  |  id | popularity    |
| direction  | String(optional)  | The direction forsorting. The acceptablefields are:●desc●asc  | asc  | asc |

Built using node, express and apollo server. Done to demostrate the benefits of graphql. apollo graphql server allows us to take a REST endpoint and use it as a source for queries of any arrangement that the frontend might need. We can also produce a REST api output alongside built on top of graphql. 