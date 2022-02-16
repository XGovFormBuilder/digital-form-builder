module.exports = {
  ci: {
    collect: {
      url: [
        "http://localhost:3000/app",
        "http://localhost:3000/app/new",
        "http://localhost:3000/app/choose-existing",
        "http://localhost:3000/app/designer/test-form-a",
        "http://localhost:3009/components/all-components",
      ],
      startServerCommand: "",
      settings: {
        //set which categories you want to run here.
        onlyCategories: ["accessibility"],
      },
    },
    assert: {},
    upload: {
      target: "filesystem",
    },
  },
};
