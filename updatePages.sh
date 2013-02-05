#!/bin/bash

git pull
git checkout gh-pages
rm -rf apidocs
git merge master

yuidoc
git add .
git push origin gh-pages
git checkout master