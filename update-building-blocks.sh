#!/bin/bash

# Mozilla FirefoxOS Building Blocks are the css/image/fonts components used
# by Yith Library Mobile Client
#
# Unfortunately their Bower package is broken and we need to just copy
# these assets directly to our app
#
# This script helps to keep them updated in our repo
#
# Clone the Building Blocks repository at
# git@github.com:buildingfirefoxos/Building-Blocks.git
# in a parent directory and checkout a specific tag

set -e
set -x

BB_DIR=../Building-Blocks
YM_DIR=.

# Copy css files
for component in action_menu buttons confirm edit_mode headers input_areas status switches drawer lists progress_activity scrolling seekbars tabs toolbars; do
    cp ${BB_DIR}/style/${component}.css ${YM_DIR}/app/styles/
done

for component in action_icons media_icons comms_icons settings_icons; do
    cp ${BB_DIR}/icons/styles/${component}.css ${YM_DIR}/app/styles/
    cp ${BB_DIR}/icons/styles/${component}.png ${YM_DIR}/public/assets/
done

for component in transitions util fonts cross_browser; do
    cp ${BB_DIR}/${component}.css ${YM_DIR}/app/styles/
done

# Copy fonts
rm -f ${YM_DIR}/public/assets/fonts/FiraSans/*
cp ${BB_DIR}/fonts/FiraSans/* ${YM_DIR}/public/assets/fonts/FiraSans/

# Copy images
for component in action_menu buttons confirm edit_mode headers input_areas status switches drawer progress_activity scrolling seekbars tabs; do
    mkdir -p ${YM_DIR}/public/assets/${component}/images
    cp -r ${BB_DIR}/style/${component}/images/* ${YM_DIR}/public/assets/${component}/images
done

# Fix image paths
sed -i "s/url(style\//url(/g" ${YM_DIR}/app/styles/cross_browser.css
