const fs = require("fs");
const path = require("path");
const parser = require("../src/parser.js");
const writer = require( "../src/writer.js");

let files = [];

const getFilesRecursively = (directory) => {
  const filesInDirectory = fs.readdirSync(directory);
  for (const file of filesInDirectory) {
    const absolute = path.join(directory, file);
    if (fs.statSync(absolute).isDirectory()) {
        getFilesRecursively(absolute);
    } else {
        files.push(absolute);
    }
  }
  return files
};

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
  includeOtherTypes: true
}

const testPost = "tests/output/post/non-attachment-to-views-by-jonathan-ekstrom.md"

const testFrontmatter =
`---
title: "Jonathan Ekstrom: Non Attachment to Views"
date: 2016-10-06
categories: 
  - book-notes
tags: 
  - jonathan-ekstrom
  - non-attachment
---`

test("creates an output directory with markdown files", async () => {
  const allDocs = await parser.parseFilePromise(defaultConfig)

  const pages = allDocs.filter(p => ["page"].includes(p.meta.type)).slice(0,2)
  const posts = allDocs.filter(p => ["post"].includes(p.meta.type)).slice(0,2)

  const slicedPosts = [ ...pages, ...posts ]

  fs.rmSync(destDir, { recursive: true, force: true });
  await writer.writeFilesPromise(slicedPosts, defaultConfig);

  expect(fs.existsSync(destDir)).toBe(true)
})

test("outputs the frontmatter in markdown", () => {
  getFilesRecursively(destDir)
  const file = files.find(f => f === testPost)
  const fileContent = fs.readFileSync(file, "utf8")
  const fileFrontmatter = fileContent.substring(0, fileContent.lastIndexOf("---") + 3)

  expect(fileFrontmatter).toMatch(testFrontmatter)
})