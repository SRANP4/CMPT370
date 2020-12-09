# CMPT 370 Fall 2020 Project

# Game: Cannonball firing at ships

Plan for requirements: - 
1.	Playing field / terrain: Water with waves
2.	Main player: The player is on a ship with a canon
3.	Add objects and interaction with main player: Other ships, clouds
4.	Non-player character: Another ship with canon firing back
5.	Change of view: Player’s view and Top view

# Code quality
- Using Standard JS
- Using ts-check and typings (but not using typescript)

- using typescript and eslint (still using standard JS)
- using this config for typescript and javascript linting using standardjs https://github.com/standard/eslint-config-standard-with-typescript#readme

# Running

Requires a static http server, eg `python3 -m http.server` or something like
[host these things please](https://github.com/thecoshman/http)


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