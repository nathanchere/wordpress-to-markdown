const fs = require("fs");
const path = require("path");
const parser = require("../src/parser.js");
const writer = require( "../src/writer.js");
const fm = require("front-matter")

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

// create a content folder with pages and blog posts
beforeAll(async () => {
  const allDocs = await parser.parseFilePromise(defaultConfig)
  const pages = allDocs.filter(p => ["page"].includes(p.meta.type))
  const posts = allDocs.filter(p => ["post"].includes(p.meta.type))
  const authors = allDocs.filter(p => ["authors"].includes(p.meta.type))

  const slicedPosts = [ ...pages, ...posts, ...authors ]

  if (fs.existsSync(destDir)) fs.rmSync(destDir, { recursive: true, force: true });
  await writer.writeFilesPromise(slicedPosts, defaultConfig);
})

test("creates a content directory with markdown files", () => {
  expect(fs.existsSync(destDir)).toBe(true)
  expect(fs.existsSync(path.join(destDir, "blog"))).toBe(true)
  expect(fs.existsSync(path.join(destDir, "authors"))).toBe(true)
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
  const fileContents = fs.readFileSync(blogPost, "utf-8")
  const fileFrontmatter = fileContents.substring(0, fileContents.lastIndexOf("---") + 3)

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

const imageWithPath = "![](assets/images/70eac-img_5-min.png)"

  test("creates blog post in blog folder", () => {
    expect(fs.existsSync(blogPost)).toBe(true)
  })

  test("blog post has required frontmatter fields", () => {
    expect(fileFrontmatter).toMatch(frontmatter)
  })

  test("image with path exists in the page's content", () => {
    expect(fileContents).toContain(imageWithPath)
  })
})

describe("Authors", () => {
  let authorsFolder = fs.readdirSync(path.join(destDir, "authors"))

  test("author from page exists in authors folder" , () => {
    let page = path.join(destDir, "sample-page.md")
    const file = fs.readFileSync(page, "utf-8")
    const pageJson = fm(file)

    let authors = authorsFolder
      .map(author => author.replace(/.md$/, ''))

    const authorPage = authors.some(author => pageJson.attributes.authors.includes(author))
    
    expect(authorPage).toBe(true)
  })

  test("author pages have id and name fields", () => {
    authorsFolder.map(file => {
      const page = fs.readFileSync(path.join(destDir, `authors/${file}`), "utf-8")
      const pageJson = fm(page)
      expect(pageJson.attributes).toHaveProperty("id", file.replace(/.md$/, ""))
      expect(pageJson.attributes).toHaveProperty("name")
    })
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
