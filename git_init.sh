#! /bin/bash
echo "Starting..."
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/Yash-op7/high-performance-api.git
git push -u origin main
echo "Fin"
