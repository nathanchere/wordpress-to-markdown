# wordpress-export-to-markdown

A script that converts a WordPress export XML file into Markdown files suitable for a static site.

Each post is saved as a separate Markdown file with appropriate frontmatter. Images are also downloaded and saved. Embedded content from YouTube, Twitter, CodePen, etc. is carefully preserved.
 

## Quick Start

You'll need:

- [Node.js](https://nodejs.org/) v12.14 or later
- Your [WordPress export file](https://wordpress.org/support/article/tools-export-screen/) (be sure to export "All content" if you want to save images and/or pages)

It is recommended that you drop your WordPress export file into the same directory that you run this script from so it's easy to find.

After cloning this repo, open your terminal to the package's directory and run:

```
npm install && node index.js
```

The script will start the wizard. Answer the questions and off you go!

## Command Line

The wizard makes it easy to configure your options, but you can also do so via the command line if you want. For example, the following will give you [Jekyll](https://jekyllrb.com/)-style output in terms of folder structure and filenames.

Using a locally cloned repo:

```
node index.js --post-folders=false --prefix-date=true
```

The wizard will still ask you about any options not specifed on the command line. To skip the wizard entirely and use default values for unspecified options, add `--wizard=false`.

## Options

- `--wizard`
    - Type: `boolean`, default: `true`
    - Enable to have the script prompt you for each option. Disable to skip the wizard and use default values for any options not specified via the command line.

- `--input`
    - Type: `file` (as a path string), default: `export.xml`
    - The path to the WordPress export file that you want to parse. It is recommended that you drop your WordPress export file into the same directory that you run this script from so it's easy to find.

- `--output`
    - Type: `folder` (as a path string), default: `output`
    - The path to the output directory where Markdown and image files will be saved. If it does not exist, it will be created for you.

- `--year-folders`, `--month-folders`, `--day-folders`
    - Type: `boolean`, default: `false`
    - Whether or not to organize output files into folders by year and/or month and/or day.

- `--post-folders`
    - Type: `boolean`, default: `true`
    - Whether or not to save files and images into post folders. If `true`, the post slug is used for the folder name and the post's Markdown file is named `index.md`. Each post folder will have its own `/images` folder. If `false`, the post slug is used to name the post's Markdown file. These files will be side-by-side and images will go into a shared `/images` folder. Either way, this can be combined with with `--year-folders` and `--month-folders`, in which case the above output will be organized under the appropriate year and month folders.

- `--prefix-date`
    - Type: `boolean`, default: `false`
    - Whether or not to prepend the post date to the post slug when naming a post's folder or file. If `--post-folders` is `true`, this affects the folder. If `--post-folders` is `false`, this affects the file.

- `--save-attached-images`
    - Type: `boolean`, default: `true`
    - Whether or not to download and save images attached to posts. Generally speaking, these are images that were uploaded by using **Add Media** or **Set Featured Image** when editing a post in WordPress. Images are saved into `/images`.

- `--save-scraped-images`
    - Type: `boolean`, default: `true`
    - Whether or not to download and save images scraped from `<img>` tags in post body content. Images are saved into `/images`. The `<img>` tags are updated to point to where the images are saved.

- `--include-other-types`
    - Type: `boolean`, default: `false`
    - Some WordPress sites make use of a `"page"` post type and/or custom post types. Set this to `true` to include these post types in the results. Posts will be organized into post type folders.

- `--include-draft-posts`
    - Type: `boolean`, default: `false`
    - Generate Markdown files for blog posts which are in 'draft' status.

- `--include-trashed-posts`
    - Type: `boolean`, default: `false`
    - Generate Markdown files for blog posts which have been soft-deleted.

- `--include-author-in-posts`
    - Type: `boolean`, default: `true`
    - If there is only one author on your Wordpress site then there's no point including this in the front matter of every Markdown file generated.


### Advanced Settings

You can edit [settings.js](https://github.com/lonekorean/wordpress-export-to-markdown/blob/master/src/settings.js) to tweak advanced settings. This includes things like throttling image downloads or customizing the date format in frontmatter.

You'll need to run the script locally (not using `npx`) to make use of advanced settings.


## Changelog  

* v2.4.0 (2024-01-25)

  - update a lot of dependencies
  - `.js` -> `.mjs`
  - `request-promise-native` -> `axios`



* v2.3.0 (2024-01-25)

  - fork favouring front matter following [Astro](https://astro.build) conventions by default
  - dependencies updated; misc fixes to accommodate some breaking changes
  - option to include draft blog posts in output (excluded by default)
  - option to include trashed blog posts in output (excluded by default)
  - option to exclude author from front matter of posts (included by default)
  - gitignore lines added to prevent accidentally commiting Wordpress exports to this repo
  - 'Page' entries will be exported under a 'page' folder (i.e. pages are no longer a special case meta type)
  - Draft and trashed blog posts will be exported under corresponding 'draft' and 'trash' folders
  - in instances where `pubDate` hasn't been set on a post (for example on draft blog posts), it will attempt to use `post_date` instead. If that also fails, it will fall back to a default date of 1990/01/01 so processing can continue but it's obvious in the output that the date is a placeholder
  - in instances where a slug hasn't been set (for example on draft blog posts), the title will be used in the output file name instead.
  - uses `pubDate` in Markdown front matter instead of `created` to be more consistent with WordPress and the defaults used by markdown consumers like Astro
  - display summary of payload failures at the end of processing

* v2.2.2

  - see [flowershow repo](https://github.com/flowershow/wordpress-to-markdown) and [lonekorean repo](https://github.com/lonekorean/wordpress-export-to-markdown) for previous versions


## License

MIT License

Copyright (c) 2018 Will Boyd
Copyright (c) 2024 Nathan Chere

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
