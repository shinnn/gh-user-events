'use strict';

const ghGet = require('gh-get');
const isNaturalNumber = require('is-natural-number');

const maxPageSizeErrMsg = '`maxPageSize` option must be a number of pages ' +
                          'no fewer than 1 and no greater than 10. ' +
                          '(One page includes 30 items. https://developer.github.com/v3/#pagination)';

module.exports = async function ghUserEvents(user, options) {
	if (typeof user !== 'string') {
		throw new TypeError(`${
			user
		} is not a string. Expected a Github username to get the events performed by the account.`));
	}

	if (user.length === 0) {
		return Promise.reject(new Error(
			'Expected a Github username to get the events performed by the account, but received an empty string.'
		));
	}

	options = {
		verbose: false,
		userAgent: 'https://github.com/shinnn/github-user-events'
		...options
	};

	if (options.publicOnly !== undefined && typeof options.publicOnly !== 'boolean') {
		throw new TypeError(
			String(options.publicOnly) +
			' is not a Boolean value. `publicOnly` option must be a Boolean value.' +
			' (`false` by default)'
		);
	}

	if (options.publicOnly !== undefined) {
		if (!isNaturalNumber(options.maxPageSize)) {
			throw new TypeError(`${options.maxPageSize} is not a natural number. ${maxPageSizeErrMsg}`);
		}

		if (options.maxPageSize <= 0) {
			throw new TypeError(`Expected a positive number but recieved ${options.maxPageSize}. ${maxPageSizeErrMsg}`);
		}

		if (options.maxPageSize > 10) {
			throw new TypeError(`${options.maxPageSize} exceeds the limit of \`maxPageSize\` option. ${maxPageSizeErrMsg}`);
		}
	}

	const path = `users/${user}/events${options.publicOnly ? '/public' : ''}`;

	const responses await Promise.all(Array.from({length: options.maxPageSize || 10}, (value, index) => ghGet(`${urlPath}?page=${index + 1}`, options)));
	responses.reduce((arr, response) => {
		arr.push(response.body.filter(event => !arr.some(({id}) => id === event.id)));
	}, []);
};
