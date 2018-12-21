
# World Around You

World Around You is a digital library of stories, created collaboratively by Deaf and hearing people for Deaf children and their families, the school community, and the Deaf community. It is a web platform designed to make collaboration easy for uploading and editing contents for reading and viewing. It provides a space to watch, read, interact, like, share, comment, upload, and edit the contents. 

This is the demo of the reader's view. Each dot along the slider bar represents a page. Each page has 3 components, or sub-pages: photo, signed video, and glossary interactivity. 

## Index

```
css - All stylesheets (Bootstrap and custom), along with fonts
img - All images/icons that the website uses
js - All scripts
text — The temporary JSON backend
videos/
    fsl_luzon — Videos for the Luzon regional dialect of Filipino Sign Language
    fsl_visayas — Videos for the Visayas regional dialect of FSL, uses a FSL_LUZON signer as a placeholder to demonstrate functionality only
index.html — Home page
```

## Key features

- After hovering over menu buttons for 0.5 seconds, a text description appears. Users often will stay that long on a button if they are uncertain what it does.

![Menu buttons interactivity](readme_gifs/menu_buttons.gif)

- Pagine through full story either using arrows or slider bar.
- Take entire panel fullscreen for an immersive user experience.

![Fullscreen interactivity](readme_gifs/fullscreen.gif)

- Change written language at any point.
- On 1st page (after title page)
    - Change sign language. Limitation: Make sure you change back to FSL: Luzon before going to any other page. 
    - Click on glossary terms to view interactivity (video loop & photo corresponding to term). Click anywhere else on the screen to stop the video loop & return to original view. 
- Drag to slide video thumbnail carousels, and hover over thumbnails for interactivity. 

![Thumbnail carousel interactivity](readme_gifs/carousel.gif) 

## Demo limitations

- GitHub serves large files with a lag. In this demo, videos are large files. For optimal performance, download and run locally. 


