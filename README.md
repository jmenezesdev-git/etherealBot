etherealBot is an Angular project that was written with the goal of making a chatbot for twitch that has the following features:

Embedded media request player

At present, core features are working. It requires access to it's backend project which itself requires access to a mongodb instance.

Not attached to the Github project is a file environment.ts
The file is of the structure:

export const environment = {
    CLIENT_SECRETID: 'SECRET_ID_HERE',
    CLIENT_ID: 'CLIENT_ID_HERE',
    TwitchOAuthAccessToken: '',
    TwitchOAuthRefreshToken: '',
    YoutubeAPIKey: 'YOUTUBE_API_KEY_HERE'
  };
  
where the text content for YOUTUBE_API_KEY_HERE, SECRET_ID_HERE, and CLIENT_ID_HERE are filled in with the relevant values on my local machine.
