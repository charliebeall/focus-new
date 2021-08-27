# FOCUS on Geography

Install [nvm](https://github.com/nvm-sh/nvm), then install node v10.24.1 (npm v6.14.12)

```
nvm install 10.24.1
nvm use 10.24.1
```

Install NodeJS dependencies

```
npm install
npm install gulp-cli bower -g
```

Install Bower dependencies

```
bower install
```

Build

```
gulp
```

All files will be built and copied to the `dist` directory

## Adding a New Feature Article, Photo Essay, or GeoQuiz
1.  Create a new folder under `src/publications/<type>` where `type` is one of `articles`, `photoessays`, or `quizzes`
2.  Create an `img` directory to hold images related to the article.  Optimize image download sizes by resizing them appropriately for the typical range of screen sizes and using [TinyJPG](https://tinyjpg.com/) to intelligently compress them.
3.  Create an `index.html` file by copying one into your newly created directory from the appropriate `src/templates/<type>` directory, or by copying an existing publication's `index.html` page.

