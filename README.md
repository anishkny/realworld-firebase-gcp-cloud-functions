# ![RealWorld Example App](logo.png)

[![CircleCI](https://img.shields.io/circleci/project/github/anishkny/realworld-firebase-gcp-cloud-functions.svg)](https://circleci.com/gh/anishkny/realworld-firebase-gcp-cloud-functions)
[![Coveralls](https://img.shields.io/coveralls/anishkny/realworld-firebase-gcp-cloud-functions.svg)](https://coveralls.io/github/anishkny/realworld-firebase-gcp-cloud-functions)
[![Greenkeeper badge](https://badges.greenkeeper.io/anishkny/realworld-firebase-gcp-cloud-functions.svg)](https://greenkeeper.io/)
[![Gitter](https://img.shields.io/gitter/room/realworld-dev/firebase-gcp.svg)](https://gitter.im/realworld-dev/firebase-gcp)

> ### Firebase + GCP Cloud Functions codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld-example-apps) spec and API.

<!--
### [Demo](https://react-redux.realworld.io/#/)&nbsp;&nbsp;&nbsp;&nbsp;[RealWorld](https://github.com/gothinkster/realworld)
-->

This codebase was created to demonstrate a fully fledged fullstack application built with **Firebase + GCP Cloud Functions** including CRUD operations, authentication, routing, pagination, and more.

We've gone to great lengths to adhere to the **Firebase + GCP Cloud Functions** community styleguides & best practices.

For more information on how to this works with other frontends/backends, head over to the [RealWorld](https://github.com/gothinkster/realworld) repo.

**Work in progress!!!**

# How it works

This repo provides an implementation for the backend as defined by the [RealWorld API Spec](https://github.com/gothinkster/realworld/tree/master/api#readme).

Authentication and Database are handled by [Firebase](https://firebase.google.com/docs/). The API is handled by a thin layer made up of [Google Cloud Platform Cloud Functions](https://cloud.google.com/functions/docs/).

# Getting started

## Setup Firebase

Clone this repo.

Setup a new Firebase project, [here](http://firebase.google.com). Note the Firebase Database URL and replace all instances of `TODO-REPLACE-THIS` in the following steps with your newly created database URL/name.

Create a new service account and store the JSON key locally as `./secrets/serviceAccountKey.json` ([help](https://firebase.google.com/docs/admin/setup)). For example:

```json
{
  "type": "service_account",
  "project_id": "TODO-REPLACE-THIS",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n ... \n-----END PRIVATE KEY-----\n",
  "client_email": "...@TODO-REPLACE-THIS.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://accounts.google.com/o/oauth2/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/..."
}
```

Store Firebase client keys config for Node.js as `./secrets/clientKey.json` ([help](https://firebase.google.com/docs/web/setup)) - Note: Make sure this is valid JSON. For example:

```json
{
  "apiKey": "...",
  "authDomain": "TODO-REPLACE-THIS.firebaseapp.com",
  "databaseURL": "https://TODO-REPLACE-THIS.firebaseio.com",
  "projectId": "TODO-REPLACE-THIS",
  "storageBucket": "TODO-REPLACE-THIS.appspot.com",
  "messagingSenderId": "..."
}
```

Execute the following code to populate an `.env` file in the project root folder:

```bash
rm -f .env && touch .env

echo FIREBASE_SERVER_KEY=`cat ./secrets/serviceAccountKey.json | base64` | tee -a .env
echo FIREBASE_CLIENT_KEY=`cat ./secrets/clientKey.json | base64` | tee -a .env
echo FIREBASE_DATABASE_URL=https://TODO-REPLACE-THIS.firebaseio.com | tee -a .env
```

When you are done, your `.env` file should look something like this

```
FIREBASE_SERVER_KEY=3M3A0NWpFcFZ ... Y29tIgp9Cg==
FIREBASE_CLIENT_KEY=ewogICJh7HJy ... MzU3NzAiCn0=
FIREBASE_DATABASE_URL=https://TODO-REPLACE-THIS.firebaseio.com
```

That's it!

## Test locally
```bash
npm install
npm test
```
_Having trouble setting things up? Come say :wave: here_ [![Gitter](https://img.shields.io/gitter/room/realworld-dev/firebase-gcp.svg)](https://gitter.im/realworld-dev/firebase-gcp)


<!--

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
-->
