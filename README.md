etherealBot is an incomplete project that is being currently written with the goal of making a chatbot for twitch that has the following features:

Embedded media request player
Embedded ai chatbot

At present it is very much a work in progress.

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
