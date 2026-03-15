module.exports = function (eleventyConfig) {
  // Passthrough copy: CSS and JS from src
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  // Passthrough copy: public assets (favicon, resume PDF, etc.)
  eleventyConfig.addPassthroughCopy("public");

  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes",
      data: "_data",
    },
  };
};
