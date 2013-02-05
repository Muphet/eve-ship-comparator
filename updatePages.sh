#!/bin/bash

git checkout gh-pages
rm -rf apidocs
yuidoc
git add .
git push origin gh-pages
git checkout master