const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const bookInstances = await BookInstance.findAll({
    include: [{
      model: Book,
      required: true
    }]
  });

  res.render('bookinstance_list', {
    title: 'Book Instance List',
    bookinstance_list: bookInstances
  });
});

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findByPk(req.params.id, {
    include: [{ model: Book }]
  });
  const book = await Book.findByPk(bookInstance.bookId);

  if (bookInstance === null) {
    const err = new Error("Book copy not found");
    err.status = 404;
    return next(err);
  }

  res.render("bookinstance_detail", {
    title: "Book:",
    bookinstance: bookInstance,
    book: book,
  });
});

// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.findAll({
    attributes: ['id', 'title'],
    order: [['title', 'ASC']]
  });

  res.render("bookinstance_form", {
    title: "Create BookInstance",
    book_list: allBooks,
  });
});

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  body("bookId", "Book must be specified").trim().escape(),
  body("imprint", "Imprint must be specified").trim().isLength({ min: 1 }).escape(),
  body("status").escape(),
  body("due_back", "Invalid date").optional({ checkFalsy: true }).isISO8601().toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const bookInstance = {
      bookId: Number(req.body.book),
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back
    };
    console.log(req.body);
    console.log(bookInstance);

    if (!errors.isEmpty()) {
      const allBooks = await Book.findAll({
        attributes: ['id', 'title'],
        order: [['title', 'ASC']]
      });

      res.render("bookinstance_form", {
        title: "Create BookInstance",
        book_list: allBooks,
        selected_book: req.body.bookId,
        errors: errors.array(),
        bookinstance: bookInstance,
      });
    } else {
      const newBookInstance = await BookInstance.create(bookInstance);
      res.redirect(newBookInstance.url);
    }
  }),
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  const bookinstance = await BookInstance.findByPk(req.params.id);
  const book = await Book.findByPk(bookinstance.bookId);

  if (!bookinstance) {
    res.redirect("/catalog/bookinstances");
    return;
  }

  res.render("bookinstance_delete", {
    title: "Delete bookinstance",
    bookinstance: bookinstance,
    book: book,
  });
});

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  await BookInstance.destroy({
    where: { id: req.body.bookinstanceid }
  });
  
  res.redirect("/catalog/bookinstances");
});


/*
// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findByPk(req.params.id, {
    include: [{ model: Book }]
  });

  if (!bookInstance) {
    const err = new Error("Book copy not found");
    err.status = 404;
    return next(err);
  }

  const allBooks = await Book.findAll({
    attributes: ['id', 'title'],
    order: [['title', 'ASC']]
  });

  res.render("bookinstance_form", {
    title: "Update BookInstance",
    book_list: allBooks,
    selected_book: bookInstance.bookId,
    bookinstance: bookInstance,
  });
});

// Handle BookInstance update on POST.
exports.bookinstance_update_post = [
  body("bookId", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified").trim().isLength({ min: 1 }).escape(),
  body("status").escape(),
  body("due_back", "Invalid date").optional({ checkFalsy: true }).isISO8601().toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const allBooks = await Book.findAll({
        attributes: ['id', 'title'],
        order: [['title', 'ASC']]
      });

      res.render("bookinstance_form", {
        title: "Update BookInstance",
        book_list: allBooks,
        selected_book: req.body.bookId,
        errors: errors.array(),
        bookinstance: req.body
      });
    } else {
      await BookInstance.update({
        bookId: req.body.bookId,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back
      }, {
        where: { id: req.params.id }
      });
      res.redirect(`/catalog/bookinstance/${req.params  .id}`);
    }
  }),
];
*/