# Utils Folder

This folder contains utility scripts to support the release process.
Currently, it includes a script to remove non-production forms before deploying to production.

### Why This Script Exists

Before every release, we need to:

- Create a feature branch from the v2 branch.
- Remove all non-production forms.
- Deploy the cleaned branch to production.

This ensures that development teams can continue working on new forms without affecting production stability.

### Script Details

- **File**: cleanNonProdForms.js
- **Purpose**: Deletes all .json form files in the current directory except those listed as production-ready.

The script uses Node.js to:

- Scan the target directory.
- Remove any .json file not listed in the PROD_FORMS array.
- Log deleted and retained files.

### How to Run

Ensure you have Node.js installed.

From the project root, run:

```
npm run clean:forms:nonprod
```

This will execute the cleanup script and remove non-production forms.

Important Notes

### ⚠️ Production Forms List:

The script relies on the PROD_FORMS array inside cleanNonProdForms.js.
If you add a new production-ready form, update this list before running the script:

Safety Tip:
Double-check the list before running the script to avoid deleting required forms.
