#!/bin/bash

git checkout gh-pages
rm -rf apidocs
git merge master
yuidoc
git add .
git commit -m "Updating gh-pages automated API docs"
git push origin gh-pages
git checkout master