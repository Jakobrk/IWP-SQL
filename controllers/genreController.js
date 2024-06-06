const Genre = require("../models/genre");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all Genres.
exports.genre_list = asyncHandler(async (req, res, next) => {
  const allGenres = await Genre.findAll({
    order: [['name', 'ASC']]
  });
  res.render("genre_list", {
    title: "Genre List",
    genre_list: allGenres,
  });
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findByPk(req.params.id);
  const booksInGenre = await Book.findAll({
    where: { genre: req.params.id },
  });

  if (!genre) {
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  res.render("genre_detail", {
    title: "Genre Detail",
    genre: genre,
    genre_books: booksInGenre,
  });
});

// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
  res.render("genre_form", { title: "Create Genre" });
};

// Handle Genre create on POST.
exports.genre_create_post = [
  body("name", "Genre name must contain at least 3 characters").trim().isLength({ min: 3 }).escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const genreData = { name: req.body.name };

    if (!errors.isEmpty()) {
      res.render("genre_form", {
        title: "Create Genre",
        genre: genreData,
        errors: errors.array(),
      });
      return;
    }

    const existingGenre = await Genre.findOne({
      where: { name: req.body.name }
    });

    if (existingGenre) {
      res.redirect(existingGenre.url);  // Make sure existingGenre is not null
    } else {
      const newGenre = await Genre.create(genreData);
      if (newGenre) {
        res.redirect(newGenre.url);  // Make sure newGenre is not null
      } else {
        res.status(500).send("Failed to create genre.");
      }
    }
  }),
];



// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findByPk(req.params.id);
  const booksInGenre = await Book.findAll({
    where: { genre: req.params.id },
  });

  if (!genre) {
    res.redirect("/catalog/genres");
    return;
  }

  res.render("genre_delete", {
    title: "Delete Genre",
    genre: genre,
    genre_books: booksInGenre,
  });
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const booksInGenre = await Book.findAll({
    where: { genre: req.params.id },
  });

  if (booksInGenre.length > 0) {
    res.render("genre_delete", {
      title: "Delete Genre",
      genre: await Genre.findByPk(req.params.id),
      genre_books: booksInGenre,
    });
    return;
  } else {
    await Genre.destroy({
      where: { id: req.params.id }
    });
    res.redirect("/catalog/genres");
  }
});


/*
// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findByPk(req.params.id);

  if (!genre) {
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  res.render("genre_form", { title: "Update Genre", genre: genre });
});

// Handle Genre update on POST.
exports.genre_update_post = [
  body("name", "Genre name must contain at least 3 characters").trim().isLength({ min: 3 }).escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("genre_form", {
        title: "Update Genre",
        genre: { id: req.params.id, name: req.body.name },
        errors: errors.array(),
      });
      return;
    } else {
      await Genre.update({ name: req.body.name }, {
        where: { id: req.params.id }
      });
      res.redirect(`/catalog/genre/${req.params.id}`);
    }
  }),
];

*/
