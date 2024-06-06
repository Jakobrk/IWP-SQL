const Author = require("../models/author");
const Book = require("../models/book");

const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

// Display list of all Authors.
exports.author_list = asyncHandler(async (req, res, next) => {
  const allAuthors = await Author.findAll({
    order: [['family_name', 'ASC']]
  });
  res.render("author_list", {
    title: "Author List",
    author_list: allAuthors,
  });
});

// Display detail page for a specific Author.
exports.author_detail = asyncHandler(async (req, res, next) => {
  const author = await Author.findByPk(req.params.id);
  const allBooksByAuthor = await Book.findAll({
    where: { authorId: req.params.id },
  });

  
  if (author === null) {
    const err = new Error("Author not found");
    err.status = 404;
    return next(err);
  }

  res.render("author_detail", {
    title: "Author Detail",
    author: author,
    author_books: allBooksByAuthor,
  });
});

// Display Author create form on GET.
exports.author_create_get = (req, res, next) => {
  res.render("author_form", { title: "Create Author", author: {} });
};

// Update the author_create_post function in authorController.js
exports.author_create_post = [
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("date_of_birth", "Invalid date of birth")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    /*
    // Format the dates
    const formatLifespan = (dob, dod) => {
      let lifespan = "";
      if (dob) {
        lifespan += dob.toISOString().split('T')[0];
      }
      lifespan += " - ";
      if (dod) {
        lifespan += dod.toISOString().split('T')[0];
      }
      return lifespan;
    };  */

    if (!errors.isEmpty()) {
      res.render("author_form", {
        title: "Create Author",
        author: req.body,
        errors: errors.array(),
      });
      return;
    } else {
      const author = await Author.create(req.body);
      const formattedAuthor = {
        ...author.toJSON(),
        name: `${author.family_name}, ${author.first_name}`,
        //lifespan: formatLifespan(author.date_of_birth, author.date_of_death)
      };
      res.redirect(author.url);
    }
  }),
];

// Display Author delete form on GET.
exports.author_delete_get = asyncHandler(async (req, res, next) => {
  const author = await Author.findByPk(req.params.id);
  const allBooksByAuthor = await Book.findAll({
    where: { authorId: req.params.id },
    
  });

  if (author === null) {
    res.redirect("/catalog/authors");
  }

  res.render("author_delete", {
    title: "Delete Author",
    author: author,
    author_books: allBooksByAuthor,
  });
});

// Handle Author delete on POST.
exports.author_delete_post = asyncHandler(async (req, res, next) => {
  const allBooksByAuthor = await Book.findAll({
    where: { authorId: req.params.id },
    attributes: ['title', 'summary']
  });
  const authorId = req.params.id

  if (allBooksByAuthor.length > 0) {
    res.render("author_delete", {
      title: "Delete Author",
      author: await Author.findByPk(authorId),
      author_books: allBooksByAuthor,
    });
    return;

  } else {
    await Author.destroy({ where: { id: authorId } });
    res.redirect("/catalog/authors");
  }
});



/*
// Display Author update form on GET.
exports.author_update_get = asyncHandler(async (req, res, next) => {
  const author = await Author.findByPk(req.params.id);
  if (author === null) {
    const err = new Error("Author not found");
    err.status = 404;
    return next(err);
  }

  res.render("author_form", { title: "Update Author", author: author });
});

// Handle Author update on POST.
exports.author_update_post = [
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("date_of_birth", "Invalid date of birth")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("author_form", {
        title: "Update Author",
        author: req.body,
        errors: errors.array(),
      });
      return;
    } else {
      await Author.update(req.body, { where: { id: req.params.id } });
      res.redirect((await Author.findByPk(req.params.id)).url);
    }
  }),
];

*/
