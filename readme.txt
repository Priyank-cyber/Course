(1) Install all dependencies and packages

npm install express mysql bcrypt body-parser express-session ejs nodemon


(2) Arrange the files and folders as per the given folder structure

Root Folders are config, node_modules, partials, public, views
Root files are app.js, package-lock.json, package.json, readme.txt

Now config has db.js
All ejs files are in views folder except header and footer as they will be in partials
public has 3 folders name img, js has .js files, css has .css files

(3)
Open Xampp and start apache and mysql server. Also click admin on apache which will open phpmyadmin.

(4)
Import course.sql file to phpmyadmin and open the database

(5)
In visual studio code open terminal and run command "nodemon app.js"