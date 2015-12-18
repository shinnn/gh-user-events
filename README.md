# gh-user-events

[![NPM version](https://img.shields.io/npm/v/gh-user-events.svg)](https://www.npmjs.com/package/gh-user-events)
[![Build Status](https://travis-ci.org/shinnn/gh-user-events.svg?branch=master)](https://travis-ci.org/shinnn/gh-user-events)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/gh-user-events.svg)](https://coveralls.io/github/shinnn/is-gist-starred?branch=master)
[![Dependency Status](https://david-dm.org/shinnn/gh-user-events.svg)](https://david-dm.org/shinnn/gh-user-events)
[![devDependency Status](https://david-dm.org/shinnn/gh-user-events/dev-status.svg)](https://david-dm.org/shinnn/gh-user-events#info=devDependencies)

Get the list of [events](https://developer.github.com/v3/activity/events/#events) on [Github](https://github.com/) performed by a user

```javascript
const ghUserEvents = require('gh-user-events');

ghUserEvents('shinnn', events => console.log(events));
```

```javascript
[
  {
    id: '3476797099',
    type: 'WatchEvent',
    actor: {
      id: 1131567,
      login: 'shinnn',
      gravatar_id: '',
      url: 'https://api.github.com/users/shinnn',
      avatar_url: 'https://avatars.githubusercontent.com/u/1131567?'
    },
    repo: {
      id: 32662888,
      name: 'purescript-contrib/node-purescript-bin',
      url: 'https://api.github.com/repos/purescript-contrib/node-purescript-bin'
    },
    payload: {
      action: 'started'
    },
    public: true,
    created_at: '2015-12-27T09:28:25Z',
    org: {
      id: 7391813,
      login: 'purescript-contrib',
      gravatar_id: '',
      url: 'https://api.github.com/orgs/purescript-contrib',
      avatar_url: 'https://avatars.githubusercontent.com/u/7391813?'
    }
  },
  // ...
]
```

## Installation

[Use npm.](https://docs.npmjs.com/cli/install)

```
npm install gh-user-events
```

## API

```javascript
const ghUserEvents = require('gh-user-events');
```

### ghUserEvents(*username* [, *options*])

*username*: `String` (a Github username, for example [https://github.com/shinnn](https://github.com/shinnn) → `'shinnn'`)  
*options*: `Object` ([`gh-get` options](https://github.com/shinnn/gh-get#options) and the [additional](https://github.com/shinnn/gh-user-events#optionstoken#optionsmaxpagesize) [ones](https://github.com/shinnn/gh-user-events#optionspubliconly))  
Return: [`Promise`](http://www.ecma-international.org/ecma-262/6.0/#sec-promise-constructor) instance

It creates API requests to get the [list of events performed by the specific Github user](https://developer.github.com/v3/activity/events/#list-events-performed-by-a-user).

When it gets the list successfully, the promise will be [*fulfilled*](https://promisesaplus.com/#point-26) with an array of event information objects.

When one of the request fails, the promise will be [*rejected*](https://promisesaplus.com/#point-30) with an error.

#### options.maxPageSize

Type: `String` (`1` ... `10`)  
Default: `10`

Set the number of [pages](https://developer.github.com/v3/#pagination) to request per function call. One page includes up to 30 items. All items in the pages will be joined into one array when the promise is fulfilled.

Note that it creates multiple API requests if `maxPageSize` option is more than 1. In other words, one function call requires at least the same number of remaining [rate limit](https://developer.github.com/v3/#rate-limiting) as this option.

##### Race condition

Under race condition, for example a new event occurs while sending multiple paginated API requests, the result rarely includes some duplicated values. In this case *gh-user-events* omits the duplicates from the array. Therefore, the number of items sometimes doesn't correspond with `30 * options.maxPageSize`.

#### options.publicOnly

Type: `Boolean`  
Default: `false`

`true` restricts the events to [only public ones](https://developer.github.com/v3/activity/events/#list-public-events-performed-by-a-user) even if you are authenticated as the given user.

## License

Copyright (c) 2015 [Shinnosuke Watanabe](https://github.com/shinnn)

Licensed under [the MIT License](./LICENSE).
