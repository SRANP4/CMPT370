# CMPT 370 Fall 2020 Project

# Game: Cannonball firing at ships

Plan for requirements:
1.	Playing field / terrain: Water with waves
2.	Main player: The player is on a ship with a canon
3.	Add objects and interaction with main player: Other ships, clouds
4.	Non-player character: Another ship with canon firing back
5.	Change of view: Player’s view and Top view

# Running

Requires a static http server, eg `python3 -m http.server`, then simply open `localhost:8000`

# Development

If you want to change code (particularity the typescript code) you'll need `npm` installed then execute in the ***project root***:
1. `npm install`
2. `npm run build`

# Code quality
- Using Standard JS (via ESLint)
- Using ts-check and typings (slowly adding in bits of typescript)
- Using this config for typescript and javascript linting using standardjs: https://github.com/standard/eslint-config-standard-with-typescript#readme

# Model won't show up? 
The parser is very picky, try using blender to fix it 
    and fix scaling / off center models at the same time! =D

Skip 2 and 3 if the model shows up at the right size in the right location already
1. Import the model into blender (File->Import .obj)
2. Scale it down (select the object, scaling options will appear on the right hand side)
3. Center the model's geometry around the origin (top left beside View, Select, Add) click Object->Set Origin->Geometry to origin
4. File->Export the selected object as .obj

#
Thanks to Zach Shaw for letting us use his framework (http://constructionyard.ca/#/refinery)