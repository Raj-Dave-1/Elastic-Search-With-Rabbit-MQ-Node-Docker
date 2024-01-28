### Dada Ki Jay Ho

## SetUp Project
1. `npm i`
2. `docker-compose up --build -d`
3. `npm run start:dev` or `npm start`

## Elastic Search Query: 
user below url to query the blogs
`http://localhost:3001/blog/query`
body (JSON):
```
{
    "title": "keyword to search"
}
```

## incremental index / adding new data to elastic search:
user below url to add new blog:
`http://localhost:3001/blog/add`
body (JSON): 
```
{
    "blogTitle": "let's learn about redis",
    "blogBody": "redis is an inmemory database"
}
```
