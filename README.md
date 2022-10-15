# An animation focused workflow frontend for Stable Diffusion
* Uses AUTOMATIC1111 as the backend with some custom scripts.
* Still a prototype, many improvements probably needed and many bugs to find.

[Video example](https://www.youtube.com/watch?v=6pKGsgN2I0U)

# How to run

## Using the binary
* Place the custom scripts from here the release (the .py files) into your `<AUTOMATIC1111>/scripts` folder
* Run the executable (e.g. .exe file)
* In your browser go to `http://localhost:4000`


## Hosted by backend
* install and run my SD backend: https://github.com/amotile/stable-diffusion-backend
  * Uses https://github.com/AUTOMATIC1111/stable-diffusion-webui as the image generator
* `npm install`
* `npm run build`
* copy the contents of the `/build` folder to the `<amotile_backend>/frontend` folder
* In your browser go to `http://localhost:4000`

## Development version
* Install and run the backend like above
* in project root run:
* `npm install`
* `npm start`
* * In your browser go to `http://localhost:5533`


# UI Tips
* You can remove keyframes by moving them up or down far enough
* If you hold shift when moving a keyframe you move the whole column or keyframes