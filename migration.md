# Migration plan

We basically want to start serving all of this in the internet, so we need to have a robust and safe system.


Frontend: Netlify (free version), with html+js+css
vvvvvv
Backend: Render (free version), with PHP
vvvvvv
Database: Supabase (postgresql, free version)


```
opgg-custom/
├── .gitignore           <-- Prevents uploading sensitive files to GitHub
├── client/              <-- Your HTML/CSS/JS (Host on Netlify)
│   ├── index.html
│   ├── style.css
│   └── script.js
│
└── server/              <-- Your PHP Backend (Host on Render)
    ├── .env             <-- Put RIOT_API_KEY here for local testing (Do NOT commit!)
    ├── Dockerfile       <-- Tells free hosts like Render how to run PHP
    └── server.php       <-- Your PHP script handling Riot API & database calls
```


Database you will keep user information, so you can avoid calling API
Information that you will keep:
+ Username to PUUID
+ You can also store the matches in the database, only refresh the matches from the API every 5 minutes (for example)

User table:
+ username+tag
+ puuid


Match table
+ puuid
+ match_id
+ champions
