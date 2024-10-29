# Canvas Puzzle Game
## Summary 
Create a puzzle game using HTML5 Canvas, 3 difficulties for player to choose. The highest completed time of players will be cached in browser   
## Scope
Create a fully functional interactive website applying HTML Canvas tag\
An area for players to select the image\
Buttons for players to select difficulties, easy is 3x4 square, normal is 5x6 square, and hard is 9x10 square\
Highest players' score will be stored in localstorage of the browser\
Players can choose to show the picture to help them finish the game\
## Team and Role
Freddy Lau developer
## Challenges
1. Ways to show images for players to select\
2. Images is hard to be changed if they are hardcode in the source code\
3. Define difficulty of the game\
4. No experience of using Canvas tag an game development\
5. Hard to drop pieces on exact position\
## Solutions
1. Used slide show library to show all images and players can drag and drop the image on the Canvas area\
2. Created a JSON file to store images' name, thumbnail path, and regular image path\ 
3. When players click the difficult button, the date will be stored in the localStorage\
4. Followed video online to learn new ideas and techniques of Canvas\
5. Used Pythagorean theorem to get the distance of selected piece position and actual position. The selected piece will be auto snapped into the right position when witin the range of distance\      
## Learning
Learned how to use Canvas\
Learned how to create crop images for a puzzle game\
Learned the algorithm on how to calculate the components distance\
## Tools
HTML5, CSS3, JavaScript, JSON
