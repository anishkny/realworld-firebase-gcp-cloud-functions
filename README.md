**Work in progress!!!**

# ![RealWorld Example App](logo.png)

> ### Firebase + GCP Cloud Functions codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld-example-apps) spec and API.

### [Demo]()&nbsp;&nbsp;&nbsp;&nbsp;[RealWorld](https://github.com/gothinkster/realworld)

This codebase was created to demonstrate a fully fledged fullstack application built with **Firebase + GCP Cloud Functions** including CRUD operations, authentication, routing, pagination, and more.

We've gone to great lengths to adhere to the **Firebase + GCP Cloud Functions** community styleguides & best practices.

For more information on how to this works with other frontends/backends, head over to the [RealWorld](https://github.com/gothinkster/realworld) repo.


# How it works

This repo provides an implementation for the backend as defined by the [RealWorld API Spec](https://github.com/gothinkster/realworld/tree/master/api#readme).

Authentication and Database are handled by [Firebase](https://firebase.google.com/docs/). The API is handled by a thin layer made up of [Google Cloud Platform Cloud Functions](https://cloud.google.com/functions/docs/).

# Getting started

## Setup Firebase

* Setup a new Firebase project, [here](http://firebase.google.com)
* Store Firebase admin keys as `./.secret/firebase-admin-keys.json`  ([help](https://firebase.google.com/docs/admin/setup))
* Store Firebase client keys config for Node.js as `./.secret/firebase-client-keys.json` ([help](https://firebase.google.com/docs/web/setup))


## Deploy and test locally

* Install [Cloud Functions Local Emulator](https://cloud.google.com/functions/docs/emulator)
* Start local emulator by executing `functions start`
* Deploy locally by executing `npm run deploy:local`

## Deploy to cloud

### Setup GCP
* Setup a new GCP Project, [here](https://console.cloud.google.com/)
* Setup GCP Cloud Functions, [here](https://console.cloud.google.com/functions)
* Create a new Storage bucket to stage Cloud Functions code, [here](https://console.cloud.google.com/storage)

### Deploy to GCP
* Modify `--stage-bucket=gs://<YOUR_BUCKET_HERE>` in `package.json`
* Deploy to cloud by executing `npm run deploy:cloud`

## Database design 
*Still evolving...*

```javascript
{
  "articles" : {
  
    "-KiNiSoqkq1HRuoylJhT" : {      // Article id (primary key)
      "author" : {
        "bio" : "Not filled yet...",
        "email" : "john@jacob.com",
        "id" : "vr7ovTnSy9VRQScqr18E7WcuWmc2",
        "image" : "https://static.productionready.io/images/smiley-cyrus.jpg",
        "token" : "eyJhbGciOiJSUzI1NiI...",
        "username" : "john@jacob.com"
      },
      "body" : "Very carefully.",
      "createdAt" : "2017-04-23T02:52:49.946Z",
      "description" : "Ever wonder how?",
      "favorited" : false,
      "favoritesCount" : 0,
      "slug" : "how-to-train-your-dragon-KiNiSoqkq1HRuoylJhT",
      "tags" : {
        "dragons" : true,
        "training" : true
      },
      "title" : "How to train your dragon",
      "updatedAt" : "2017-04-23T02:52:49.946Z"
    },

    "-JhLeOlGIEjaIOFHR0xd" : {
      ... another article ..
    },

    "-JhQ7APk0UtyRTFO9-TS" : {      
      ... another article, and so on ..
    },


  },      // End of articles "table"
  
  "slugs" : {       // Maps slugs back to article id
    "how-to-train-your-dragon-KiNiSoqkq1HRuoylJhT" : "-KiNiSoqkq1HRuoylJhT",
    "another-cool-article-JhQ76OEK_848CkIFhAq": "-JhQ76OEK_848CkIFhAq",
    ...
  },
  
  "tags" : {        // Lists articles ids under each tag
    "dragons" : {
      "-KiNiSoqkq1HRuoylJhT" : true
      "-JhLeOlGIEjaIOFHR0xd" : true
      ...
    },
    "training" : {
      "-KiNiSoqkq1HRuoylJhT" : true
      "-JhQ76OEK_848CkIFhAq" : true
      "-JhQ7APk0UtyRTFO9-TS" : true
      ...
    }
  }
}

```
