import chalk from 'chalk';
const fs = await import('fs');
const luxon = await import('luxon');
const path = await import('path');
import get from 'axios';

const { getFilenameFromUrl } = await import('./shared.mjs');
const settings = import('./settings.mjs');

export async function writeFilesPromise(posts, config) {
	await writeMarkdownFilesPromise(posts, config);
	await writeImageFilesPromise(posts, config);
}

async function processPayloadsPromise(payloads, loadFunc) {
	const promises = payloads.map(payload => new Promise((resolve, reject) => {
		setTimeout(async () => {
			try {
				const result = await loadFunc(payload.item);
				await writeFile(payload.destinationPath, result.data);
				console.log(chalk.green('[OK]') + ' ' + payload.name);
				resolve();
			} catch (ex) {
				console.log(chalk.red('[FAILED]') + ' ' + payload.name + ' ' + chalk.red('(' + ex.toString() + ')'));
				reject({ payload: payload.name, error: ex.toString() });
			}
		}, payload.delay);
	}));

	const results = await Promise.allSettled(promises);
	const failed = results.filter(result => result.status === 'rejected');
	const failedCount = failed.length;
	if (failedCount === 0) {
		console.log('Done, got them all!');
	} else {
		console.log('Done, but with ' + chalk.red(failedCount + ' failed payloads') + ':');
		failed.forEach(result =>
			console.log(chalk.red("[X] ") + result.reason.payload + ': ' + result.reason.error)
		);
	}
}

async function writeFile(destinationPath, data) {
	await fs.promises.mkdir(path.dirname(destinationPath), { recursive: true });
	await fs.promises.writeFile(destinationPath, data, 'utf8');
}

async function writeMarkdownFilesPromise(posts, config) {
	// console.log(posts)
	// package up posts into payloads
	let skipCount = 0;
	let delay = 0;
	const payloads = posts.flatMap(post => {
		const destinationPath = getPostPath(post, config);
		if (checkFile(destinationPath)) {
			// already exists, don't need to save again
			skipCount++;
			return [];
		} else {
			const payload = {
				item: post,
				name: (!config.includeOtherTypes ? '' : post.meta.type === "post" ? "blog" + ' - ' : post.meta.type + ' - ') + post.meta.slug,
				destinationPath,
				delay
			};
			delay += settings.markdown_file_write_delay;
			return [payload];
		}
	});

	const remainingCount = payloads.length;
	if (remainingCount + skipCount === 0) {
		console.log('\nNo posts to save...');
	} else {
		console.log(`\nSaving ${remainingCount} posts (${skipCount} already exist)...`);
		await processPayloadsPromise(payloads, loadMarkdownFilePromise);
	}
}

async function loadMarkdownFilePromise(post) {
	let output = '---\n';

	Object.entries(post.frontmatter).forEach(([key, value]) => {
		let outputValue;
		if (Array.isArray(value)) {
			if (value.length > 0) {
				// array of one or more strings
				outputValue = value.reduce((list, item) => `${list}\n  - ${item}`, '');
			}
		} else {
			// single string value
			const escapedValue = (value || '').replace(/"/g, '\\"');
			outputValue = (key === "title" || key === "description") ? `"${escapedValue}"` : `${escapedValue}`;
		}

		if (outputValue !== undefined) {
			output += `${key}: ${outputValue}\n`;
		}
	});

	if (post.content) {
		output += `---\n\n${post.content}\n`
	} else {
		output += `---\n`
	}
	return output;
}

async function writeImageFilesPromise(posts, config) {
	// collect image data from all posts into a single flattened array of payloads
	let skipCount = 0;
	let delay = 0;
	const payloads = posts.flatMap(post => {
		// const postPath = getPostPath(post, config);
		// const imagesDir = path.join(path.dirname(postPath), 'images');
		const imagesDir = path.join(config.output, 'assets/images');
		return post.meta.imageUrls?.flatMap(imageUrl => {
			const filename = getFilenameFromUrl(imageUrl);
			const isPdfDocument = /.pdf$/.test(filename)
			const destinationPath = isPdfDocument
				? path.join(config.output + "/assets", filename)
				: path.join(imagesDir, filename);
			if (checkFile(destinationPath)) {
				// already exists, don't need to save again
				skipCount++;
				return [];
			} else {
				const payload = {
					item: imageUrl,
					name: filename,
					destinationPath,
					delay
				};
				delay += settings.image_file_request_delay;
				return [payload];
			}
		});
	});

	const remainingCount = payloads.length;
	if (remainingCount + skipCount === 0) {
		console.log('\nNo images to download and save...');
	} else {
		console.log(`\nDownloading and saving ${remainingCount} images (${skipCount} already exist)...`);
		await processPayloadsPromise(payloads, loadImageFilePromise);
	}
}

async function loadImageFilePromise(imageUrl) {
	// only encode the URL if it doesn't already have encoded characters
	const url = (/%[\da-f]{2}/i).test(imageUrl) ? imageUrl : encodeURI(imageUrl);

	let buffer;
	try {
		buffer = await get({
			url,
			encoding: null, // preserves binary encoding
			headers: {
				'User-Agent': 'wordpress-export-to-markdown'
			}
		});
	} catch (ex) {
		if (ex.name === 'StatusCodeError') {
			// these errors contain a lot of noise, simplify to just the status code
			ex.message = ex.statusCode;
		}
		throw ex;
	}
	return buffer;
}

function getPostPath(post, config) {
	const dt = luxon.DateTime.fromISO(post.frontmatter.pubDate);

	// start with base output dir
	const pathSegments = [config.output];

	// create segment for post type if we're dealing with more than just "post"
	if (config.includeOtherTypes) {
		pathSegments.push(post.meta.type === "post" ? "blog" : post.meta.type);
	}

	if (post.meta.type == "post"
		&& config.includeDraftPosts
		&& post.meta.status == "draft") {
		pathSegments.push("drafts");
	}

	if (post.meta.type == "post"
		&& config.includeTrashedPosts
		&& post.meta.status == "trash") {
		pathSegments.push("trash");
	}

	if (config.yearFolders && post.meta.type !== "page") {
		pathSegments.push(dt.toFormat('yyyy'));
	}

	if (config.monthFolders && post.meta.type !== "page") {
		pathSegments.push(dt.toFormat('LL'));
	}

	if (config.dayFolders && post.meta.type !== "page") {
		pathSegments.push(dt.toFormat('dd'));
	}

	// create slug fragment, possibly date prefixed
	let slugFragment = post.meta.slug;
	if (config.prefixDate) {
		slugFragment = dt.toFormat('yyyy-LL-dd') + '-' + slugFragment;
	}

	// use slug fragment as folder or filename as specified
	if (config.postFolders) {
		pathSegments.push(slugFragment, 'index.md');
	} else {
		pathSegments.push(slugFragment + '.md');
	}

	return path.join(...pathSegments);
}

function checkFile(path) {
	return fs.existsSync(path);
}