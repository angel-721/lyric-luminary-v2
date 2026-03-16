# Lyric Luminary Frontend(v2)

Check out the original project that has the model training scripts [here](https://github.com/angel-721/lyric-luminary).

The model is hosted this [hugging space](https://huggingface.co/spaces/angel-721/song-genre-classifier/tree/main) 🤗

- P.S: The current hosted model is a bit out of date and tends to predict a lot of things as metal. I need to either retrain the model or find the old model that had a much higher accuracy.

Project is hosted on [https://luminary.angelv.dev](https://luminary.angelv.dev/)


<img width="798" height="876" alt="screenshot" src="https://github.com/user-attachments/assets/99ac33b0-1a34-4cad-b76f-e1979f42310a" />

## sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
bun x sv@0.12.5 create --template minimal --types ts --add tailwindcss="plugins:none" --install bun my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
