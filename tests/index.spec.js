const fs = require("fs");
const path = require("path");
const parser = require("../src/parser.js");
const writer = require( "../src/writer.js");

const destDir = 'tests/content'

const defaultConfig = {
  input: './tests/fixtures/testing.wordpress.xml',
  output: destDir,
  assets: 'assets',
  yearFolders: false,
  monthFolders: false,
  dayFolders: false,
  postFolders: false,
  prefixDate: false,
  saveAttachedImages: true,
  saveScrapedImages: true,
  includeOtherTypes: true
}

// create a content folder with one page and one blog post
beforeAll(async () => {
  const allDocs = await parser.parseFilePromise(defaultConfig)
  const pages = allDocs.filter(p => ["page"].includes(p.meta.type))
  const posts = allDocs.filter(p => ["post"].includes(p.meta.type))

  const slicedPosts = [ ...pages, ...posts ]

  if (fs.existsSync(destDir)) fs.rmSync(destDir, { recursive: true, force: true });
  await writer.writeFilesPromise(slicedPosts, defaultConfig);
})

test("creates a content directory with markdown files", () => {
  expect(fs.existsSync(destDir)).toBe(true)
  expect(fs.existsSync(path.join(destDir, "blog"))).toBe(true)
})

describe("Pages", () => {
  let page = path.join(destDir, "sample-page.md")

  const frontmatter =
`---
title: "Home"
created: 2022-12-07
authors: 
  - rufus6922c5bca9
---`

  test("creates page in content's root folder", () => {
    expect(fs.existsSync(page)).toBe(true)
  })

  test("page has frontmatter fields", () => {
    const fileContents = fs.readFileSync(page, "utf-8")
    const fileFrontmatter = fileContents.substring(0, fileContents.lastIndexOf("---") + 3)

    expect(fileFrontmatter).toMatch(frontmatter)
  })
})

describe("Blog posts", () => {
  let blogPost = path.join(destDir, "blog/nicomachean-ethics-by-aristotle.md")

  const frontmatter =
`---
title: "Nicomachean Ethics by Aristotle"
created: 2022-12-07
categories: 
  - developer
  - digital-nomad
tags: 
  - climate-change
  - data
authors: 
  - rufus6922c5bca9
image: /assets/images/70eac-img_5-min.png
---`

  test("creates blog post in blog folder", () => {
    expect(fs.existsSync(blogPost)).toBe(true)
  })

  test("blog post has required frontmatter fields", () => {
    const fileContents = fs.readFileSync(blogPost, "utf-8")
    const fileFrontmatter = fileContents.substring(0, fileContents.lastIndexOf("---") + 3)
    expect(fileFrontmatter).toMatch(frontmatter)
  })
})

describe("Assets" , () => {
  let assetsFolder = path.join(destDir, "assets")

  test("creates an assets folder", () => {
    expect(fs.existsSync(assetsFolder)).toBe(true)
  })

  test("creates a pdf in assets folder", () => {
    let pdfFile = path.join(assetsFolder,"hexagonal.pdf")
    expect(fs.existsSync(pdfFile)).toBe(true)
  })

  test("creates a image in assets/images folder", () => {
    let imageFile = path.join(assetsFolder,"images/70eac-img_5-min.png")
    expect(fs.existsSync(imageFile)).toBe(true)
  })
})

// test("parses the frontmatter title correctly", async () => {
//   const allDocs = await parser.parseFilePromise(defaultConfig)
//   const page = allDocs.find(f => f.meta.slug === "imaginary-society")

//   expect(page.frontmatter.title).toEqual("Imaginary Society")
// })
