#!/usr/bin/env node

const path = await import('path');

const { getConfig } = await import('./src/wizard.mjs');
const parser = await import('./src/parser.mjs');
const writer = await import('./src/writer.mjs');

(async () => {
	// parse any command line arguments and run wizard
	const config = await getConfig(process.argv);

	// parse data from XML and do Markdown translations
	const posts = await parser.parseFilePromise(config)

	// write files, downloading images as needed
	await writer.writeFilesPromise(posts, config);

	// happy goodbye
	console.log('\nAll done!');
	console.log('Look for your output files in: ' + path.resolve(config.output));
})().catch(ex => {
	// sad goodbye
	console.log('\nSomething went wrong, execution halted early.');
	console.error(ex);
});
