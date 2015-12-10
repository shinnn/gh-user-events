'use strong';

const ghUserEvents = require('.');
const test = require('tape');

process.env.GITHUB_TOKEN = '';

test('ghUserEvents()', t => {
  t.plan(16);

  t.strictEqual(ghUserEvents.name, 'ghUserEvents', 'should have a function name.');

  ghUserEvents('greenkeeperio-bot', {token: process.env.TOKEN_FOR_TEST}).then(events => {
    t.deepEqual(
      events.map(event => event.type),
      new Array(300).fill('PullRequestEvent'),
      'should get the events performed by a given user.'
    );
    t.deepEqual(
      events.map(e => e.created_at),
      events.map(e => e.created_at).sort((a, b) => Date.parse(b) - Date.parse(a)),
      'should get the events ordered by newest first.'
    );
  }).catch(t.fail);

  ghUserEvents('greenkeeperio-bot', {
    token: process.env.TOKEN_FOR_TEST,
    maxPageSize: 1
  }).then(events => {
    t.deepEqual(
      events.map(event => event.type),
      new Array(30).fill('PullRequestEvent'),
      'should limit the number of events via `maxPageSize` option.'
    );
  }).catch(t.fail);

  ghUserEvents('linus', {token: process.env.TOKEN_FOR_TEST}).then(events => {
    t.deepEqual(
      events,
      [],
      'should be resolved with an empty array when the account has no activity recently.'
    );
  }).catch(t.fail);

  ghUserEvents('9'.repeat(99), {token: process.env.TOKEN_FOR_TEST}).then(t.fail, err => {
    t.strictEqual(
      err.message,
      'Not Found',
      'should fail when it cannot find the user.'
    );
    t.strictEqual(
      'response' in err,
      false,
      'should not add `header` property to the error when `verbose` option is not enabled.'
    );
  }).catch(t.fail);

  ghUserEvents('greenkeeperio-bot', {
    publicOnly: true,
    token: 'FOO',
    verbose: true,
    headers: {'user-agenT': 'bar'}
  }).then(t.fail, err => {
    t.strictEqual(
      err.message,
      'Bad credentials',
      'should fail when the token is not valid.'
    );
    t.deepEqual(
      err.response.req._headers['user-agent'], //eslint-disable-line
      'bar',
      'should add `header` property to the error when `verbose` option is enabled.'
    );
  }).catch(t.fail);

  ghUserEvents(1).then(t.fail, err => {
    t.strictEqual(
      err.message,
      '1 is not a string. Expected a Github username to get the events performed by the account.',
      'should fail when it takes a non-string argument.'
    );
  }).catch(t.fail);

  ghUserEvents('').then(t.fail, err => {
    t.strictEqual(
      err.message,
      'Expected a Github username to get the events performed by the account, but received an empty string.',
      'should fail when it takes an empty string.'
    );
  }).catch(t.fail);

  ghUserEvents('1', {verbose: 1}).then(t.fail, err => {
    t.strictEqual(
      err.message,
      '1 is not a Boolean value. `verbose` option must be a Boolean value. (`false` by default)',
      'should fail when `verbose` option is not a Boolean value.'
    );
  }).catch(t.fail);

  ghUserEvents('1', {publicOnly: 1}).then(t.fail, err => {
    t.strictEqual(
      err.message,
      '1 is not a Boolean value. `publicOnly` option must be a Boolean value. (`false` by default)',
      'should fail when `publicOnly` option is not a Boolean value.'
    );
  }).catch(t.fail);

  ghUserEvents('1', {maxPageSize: '!'}).then(t.fail, err => {
    t.ok(
      err.message.includes('! is not a natural number. `maxPageSize` option must be a number of pages'),
      'should fail when `maxPageSize` option is not a natural number.'
    );
  }).catch(t.fail);

  ghUserEvents('1', {maxPageSize: 0}).then(t.fail, err => {
    t.ok(
      err.message.includes('Expected a positive number but recieved 0.'),
      'should fail when `maxPageSize` option is not a positive number.'
    );
  }).catch(t.fail);

  ghUserEvents('1', {maxPageSize: 11}).then(t.fail, err => {
    t.ok(
      err.message.includes('11 exceeds the limit of `maxPageSize` option.'),
      'should fail when `maxPageSize` option is greater than 10.'
    );
  }).catch(t.fail);
});

test('isGistStarred() with `GITHUB_TOKEN` environment variable', t => {
  t.plan(1);

  process.env.GITHUB_TOKEN = process.env.TOKEN_FOR_TEST;

  ghUserEvents('greenkeeperio-bot').then(events => {
    t.deepEqual(
      events.map(event => event.type),
      new Array(300).fill('PullRequestEvent'),
      'use the `GITHUB_TOKEN` environment variable as an access token.'
    );
  }).catch(t.fail);
});
