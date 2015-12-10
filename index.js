/*!
 * gh-user-events | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/gh-user-events
*/
'use strict';

const arrFilter = require('arr-filter');
const arrReduce = require('arr-reduce');
const fettuccine = require('fettuccine');
const filledArray = require('filled-array');
const ghifyRequestOptions = require('ghify-request-options');
const isNaturalNumber = require('is-natural-number');

function createInvalidBooleanOptionError(options, propertyName) {
  return new TypeError(
    String(options[propertyName]) +
    ' is not a Boolean value. `' +
    propertyName +
    '` option must be a Boolean value.' +
    ' (`false` by default)'
  );
}

const maxPageSizeErrMsg = '`maxPageSize` option must be a number of pages ' +
                          'no fewer than 1 and no greater than 10. ' +
                          '(One page includes 30 items. https://developer.github.com/v3/#pagination)';

module.exports = function ghUserEvents(user, options) {
  if (typeof user !== 'string') {
    return Promise.reject(new TypeError(
      `${user} is not a string. Expected a Github username to get the events performed by the account.`
    ));
  }

  if (user === '') {
    return Promise.reject(new Error(
      'Expected a Github username to get the events performed by the account, but received an empty string.'
    ));
  }

  options = Object.assign({
    publicOnly: false,
    verbose: false,
    maxPageSize: 10
  }, options);

  if (typeof options.publicOnly !== 'boolean') {
    return Promise.reject(createInvalidBooleanOptionError(options, 'publicOnly'));
  }

  if (typeof options.verbose !== 'boolean') {
    return Promise.reject(createInvalidBooleanOptionError(options, 'verbose'));
  }

  if (options.maxPageSize <= 0) {
    return Promise.reject(new TypeError(`Expected a positive number but recieved ${options.maxPageSize}. ${maxPageSizeErrMsg}`));
  }

  if (options.maxPageSize > 10) {
    return Promise.reject(new TypeError(`${options.maxPageSize} exceeds the limit of \`maxPageSize\` option. ${maxPageSizeErrMsg}`));
  }

  if (!isNaturalNumber(options.maxPageSize)) {
    return Promise.reject(new TypeError(`${options.maxPageSize} is not a natural number. ${maxPageSizeErrMsg}`));
  }

  options.headers = Object.assign({
    'user-agent': 'https://github.com/shinnn/github-user-events'
  }, options.headers);

  const urlPath = `users/${user}/events`;

  options = ghifyRequestOptions(options);

  return Promise.all(filledArray(function createRequestUrl(index) {
    return fettuccine(`${urlPath}?page=${index + 1}`, options);
  }, options.maxPageSize))
  .then(function joinUserEvents(responses) {
    return Promise.resolve(arrReduce(responses, (arr, response) => {
      if (typeof response.body.message === 'string') {
        const error = new Error(response.body.message);

        if (options.verbose) {
          error.response = response;
        }

        throw error;
      }

      arr.push(...arrFilter(response.body, function removeDuplicates(event) {
        return !arr.some(el => el.id === event.id);
      }));
      return arr;
    }, []));
  });
};
