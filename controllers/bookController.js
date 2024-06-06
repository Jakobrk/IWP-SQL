const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookinstance");

const { body, validationResult } = require("express-validator");


const asyncHandler = require("express-async-handler");
const author = require("../models/author");


exports.index = asyncHandler(async (req, res, next) => {
  // Get details of books, book instances, authors and genre counts (in parallel)
  const [
    numBooks,
    numBookInstances,
    numAvailableBookInstances,
    numAuthors,
    numGenres,
  ] = await Promise.all([
    Book.count(), // Replaced countDocuments with count
    BookInstance.count(), // Replaced countDocuments with count
    BookInstance.count({ where: { status: "Available" } }), // Filter for available instances
    Author.count(), // Replaced countDocuments with count
    Genre.count(), // Replaced countDocuments with count
  ]);

  res.render("index", {
    title: "Local Library Home",
    book_count: numBooks,
    book_instance_count: numBookInstances,
    book_instance_available_count: numAvailableBookInstances,
    author_count: numAuthors,
    genre_count: numGenres,
  });
});


//Displays list of books
// Ensure your query includes the author
exports.book_list = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.findAll({
    include: [{
      model: Author,
      attributes: ['first_name', 'family_name']
    }],
    order: [['title', 'ASC']]
  });

  console.log(allBooks); // Add this line to log the output and check if authors are included

  res.render("book_list", {
    title: "Book List",
    book_list: allBooks
  });
});


// Display detail page for a specific book.
exports.book_detail = asyncHandler(async (req, res, next) => {
  // Get details of books, book instances for specific book
  const [book] = await Promise.all([
    Book.findByPk(req.params.id),
  ]);

  const allBookInstances = await BookInstance.findAll({
    where: { bookId: req.params.id },
  });

  const author = await Author.findByPk(book.authorId);
  const genre = await Genre.findByPk(book.genre);

  if (book === null) {
    // No results.
    const err = new Error("Book not found");
    err.status = 404;
    return next(err);
  }
  //console.log(book);
  res.render("book_detail", {
    title: book.title,
    book: book,
    book_instances: allBookInstances,
    author: author,
    genre: genre,
  });
});


// Display book create form on GET.
exports.book_create_get = asyncHandler(async (req, res, next) => {
  // Get all authors and genres for the book form
  const [allAuthors, allGenres] = await Promise.all([
    Author.findAll({ order: [['family_name', 'ASC']] }), // Corrected to findAll and added sorting
    Genre.findAll({ order: [['name', 'ASC']] }) // Assuming you have a similar issue with Genre
  ]);

  res.render("book_form", {
    title: "Create Book",
    authors: allAuthors,
    genres: allGenres
  });
});

// Handle book create on POST.
exports.book_create_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),
  // Process request after validation and sanitization.

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped and trimmed data.
    const book = new Book({
      title: req.body.title,
      authorId: Number(req.body.author),
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    });
    console.log("HEEEEYYYAAAAAAA bay u dog")
    console.log(req.body);
    console.log(book);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      const [allAuthors, allGenres] = await Promise.all([
        Author.find().sort({ family_name: 1 }).exec(),
        Genre.find().sort({ name: 1 }).exec(),
      ]);

      // Mark our selected genres as checked.
      for (const genre of allGenres) {
        if (book.genre.includes(genre.id)) {
          genre.checked = "true";
        }
      }
      res.render("book_form", {
        title: "Create Book",
        authors: allAuthors,
        genres: allGenres,
        book: book,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save book.
      await book.save();
      res.redirect(book.url);
    }
  }),
];


// Display book delete form on GET.
exports.book_delete_get = asyncHandler(async (req, res, next) => {
  const [book] = await Promise.all([
    Book.findByPk(req.params.id),
  ]);

  const allBookInstances = await BookInstance.findAll({
    where: { bookId: req.params.id },
  });

  if (book === null) {
    // No results.
    res.redirect("/catalog/books");
  }

  res.render("book_delete", {
    title: "Delete Book",
    book: book,
    book_instances: allBookInstances,
  });
});

// Handle book delete on POST.
exports.book_delete_post = asyncHandler(async (req, res, next) => {
  const [book] = await Promise.all([
    Book.findByPk(req.params.id),
  ]);

  const allBookInstances = await BookInstance.findAll({
    where: { bookId: req.params.id },
  });

  if (allBookInstances.length > 0) {
    // Book has instances. Render in same way as for GET route.
    res.render("book_delete", {
      title: "Delete Book",
      book: book,
      author: author,
      book_instances: allBookInstances,
    });
    return;

  } else {
    // Author has no books. Delete object and redirect to the list of authors.
    await Book.destroy({where: { id: book.id } });
    res.redirect("/catalog/books");
  }
});


/*
// Display book update form on GET.
exports.book_update_get = asyncHandler(async (req, res, next) => {
  // Get book, authors and genres for form.
  const [book, allAuthors, allGenres] = await Promise.all([
    Book.findById(req.params.id).populate("author").exec(),
    Author.find().sort({ family_name: 1 }).exec(),
    Genre.find().sort({ name: 1 }).exec(),
  ]);

  if (book === null) {
    // No results.
    const err = new Error("Book not found");
    err.status = 404;
    return next(err);
  }

  // Mark our selected genres as checked.
  allGenres.forEach((genre) => {
    if (book.genre.includes(genre._id)) genre.checked = "true";
  });

  res.render("book_form", {
    title: "Update Book",
    authors: allAuthors,
    genres: allGenres,
    book: book,
  });
});

// Handle book update on POST.
exports.book_update_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped/trimmed data and old id.
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form
      const [allAuthors, allGenres] = await Promise.all([
        Author.find().sort({ family_name: 1 }).exec(),
        Genre.find().sort({ name: 1 }).exec(),
      ]);

      // Mark our selected genres as checked.
      for (const genre of allGenres) {
        if (book.genre.indexOf(genre._id) > -1) {
          genre.checked = "true";
        }
      }
      res.render("book_form", {
        title: "Update Book",
        authors: allAuthors,
        genres: allGenres,
        book: book,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const updatedBook = await Book.findByIdAndUpdate(req.params.id, book, {});
      // Redirect to book detail page.
      res.redirect(updatedBook.url);
    }
  }),
];
*/
