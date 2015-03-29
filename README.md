# &lt;e-book&gt;

Custom Element to embed ebook into webpage

[BiB/i][] is used for EPUB format, object elements is used for PDF format for now.

## Demo

[Check it live!](http://KitaitiMakoto.github.io/bibi-customelement)

## Install

Install the component using [Bower](http://bower.io/):

```sh
$ bower install --save e-book
```

Or [download as ZIP](https://github.com/KitaitiMakoto/bibi-customelement/archive/master.zip).

## Usage

1. Import Web Components' polyfill:

    ```html
    <script src="bower_components/webcomponentsjs/webcomponents.min.js"></script>
    ```

2. Import Custom Element:

    ```html
    <link rel="import" href="bower_components/e-book/src/e-book.html">
    ```

3. Start using it!

    ```html
    <e-book src="http://example.net/path/to/unpacked/book"></e-book>
    ```

    ```html
    <e-book src="http://example.net/path/to/book.epub"></e-book>
    ```

    ```html
    <e-book>
      <source src="http://example.net/path/to/book.epub" type="application/epub+zip"></source>
    </e-book>
    ```

    ```html
    <e-book src="http://example.net/path/to/book.pdf"></e-book>
    ```

## Options

Attribute     | Options     | Default      | Description
---           | ---         | ---          | ---
`src`         | *DOMString* | `""`         | Ebook URL. *LIIMTATION*: Currently can load books under app/bookshelf directory for EPUB format.
`poster`      | *DOMString* | `""`         | Poster image URL.
`autostart`   | *Boolean*   | `false`      | Ebook loaded automatically if `true`.
`target`      | *DOMString* | `"_blank"`       | Target window name which opens when new window link is clicked.

## Methods

Method        | Parameters   | Returns     | Description
---           | ---          | ---         | ---
`load()`      | None.        | `Promise`   | Load ebook. Returns a `Promise` with resource object which has `src` and `type` properties. Used after changing inner `source` element.

## Events

Event         | Description
---           | ---
`onload`      | Fired on iframe's onload(not when book loaded).

## Content Model

Requires `source` when it doesn't have `src` attribute.

## Detail behaviors

### Loading timing

If `<e-book>` has `src` attribute, it loads ebook when creating.

```javascript
var eBook = document.createElement("e-book");
eBook.src = "path/to/ebook.epub"; // => start loading ebook
```

If not, when it is attached to the DOM tree it searches `source` elements from child elements and then load ebook.

```javascript
var eBook = document.createElement("e-book");
var source = document.createElement("source");
source.src = "path/to/ebook.epub";
source.type = "application/epub+zip";
eBook.appendChild(source);
document.body.appendChild(eBook); // => start loading ebook
```

## Development

In order to run it locally you'll need to fetch some dependencies and a basic server setup.

* Install [Bower](http://bower.io/) & [Grunt](http://gruntjs.com/):

```sh
$ [sudo] npm install -g bower grunt-cli
```

* Install local dependencies:

```sh
$ bower install && npm install
```

* To test your project, start the development server and open `http://localhost:8000`.

```sh
$ grunt server
```

* To provide a live demo, send everything to `gh-pages` branch.

```sh
$ grunt deploy
```

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## History

For detailed changelog, check [Releases](https://github.com/KitaitiMakoto/e-book/releases).

## License

[GPLv3](http://www.gnu.org/licenses/gpl.html) or later

[BiB/i]: https://github.com/satorumurmur/bibi
