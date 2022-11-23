const fs = require("fs");
const path = require("path");
const parser = require('../src/parser.js');
const writer = require( "../src/writer.js");

const destDir = 'tests/output'

const defaultConfig = {
  input: './lifeitself.xml',
  output: destDir,
  yearFolders: false,
  monthFolders: false,
  postFolders: false,
  prefixDate: false,
  saveAttachedImages: false,
  saveScrapedImages: false,
  includeOtherTypes: false
}

test("creates an output directory with markdown files", async () => {
  const posts = await parser.parseFilePromise(defaultConfig)
  const slicedPosts = posts.slice(0,2)

  fs.rmSync(destDir, { recursive: true, force: true });
  await writer.writeFilesPromise(slicedPosts, defaultConfig);

  expect(fs.existsSync(destDir)).toBe(true)

})

const content = `---
title: Nine Theses
date: 2017-05-23
categories: 
  - our-philosophy
tags: 
  - rufus-pollock
  - theses
---`

test("outputs the frontmatter in markdown", async () => {
  const posts = await parser.parseFilePromise(defaultConfig)
  const slicedPosts = posts.slice(0,2)

  fs.rmSync(destDir, { recursive: true, force: true });
  await writer.writeFilesPromise(slicedPosts, defaultConfig);

  const file = fs.readdirSync(destDir)[0]
  const fileContent = fs.readFileSync(path.join(destDir + "/" + file), { encoding: "utf8"})

  expect(fs.existsSync(destDir)).toBe(true)
  expect(fileContent).toContain(content)

})