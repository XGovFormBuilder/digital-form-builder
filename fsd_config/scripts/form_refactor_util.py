import argparse
import json
import os
from typing import Sequence

#  TODO make changes to the designer so that we do not need to run this script on every form

FORMS_DIR = "../form_jsons/public"  # assumes being ran from root/scripts directory
# FORMS_DIR = "../../digital-form-builder/runner/src/server/forms"


# FS-2193: In order to meet the "Label in name" accessibility standard,
# changes have been made to the form runner which allows us to hide the
# title and provide html in the label.
# See: https://github.com/communitiesuk/digital-form-builder/pull/108

# This script will update the form jsons to use this new functionality,
# by adding a "hideTitle" property to the component options and moving
# the title into the hint.


# Doing so allows screen readers to read the label and hint together,
# which is the desired behaviour. The title styling is still applied.
def _place_title_in_hint_as_html(form_content: dict) -> dict:
    for page in form_content["pages"]:
        for component in page["components"]:
            if all(
                [
                    component["type"] == "MultilineTextField",
                    not component["options"].get("hideTitle"),
                    "hint" in component,
                ]
            ):
                component["options"]["hideTitle"] = True
                component["hint"] = (
                    '<span class="govuk-label govuk-label--s">'
                    f"{component['title']}</span>{component['hint']}"
                )
    return form_content


# HOW TO USE:
#   python scripts/form_refactor_util.py mutation-key --dir form_jsons/public

# To add a new mutation, add a new key to this dictionary, the key is a unique
# identifier for the mutation, and the value is the function that will be
# called to perform the mutation. Please write a comment above the function
# describing what it does if you feel it is not obvious.
_MUTATIONS = {
    "fs-2193-place_title_in_hint_as_html": _place_title_in_hint_as_html,
}

# To make sure your mutation works as expected, or to do test driven
# development, you can add input/expected json files to the
# tests/form_refactor_util directory.


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("key", type=str, help="Key in mutations dictionary")
    parser.add_argument(
        "--dir",
        type=str,
        default=FORMS_DIR,
        help="Directory containing forms",
    )

    args = parser.parse_args(argv)
    mutation_key = args.key
    forms_dir = args.dir

    if mutation_key not in _MUTATIONS:
        raise ValueError(f"Invalid mutation key provided: {mutation_key}")

    mutation_function = _MUTATIONS[mutation_key]

    for subdir, _, files in os.walk(forms_dir):
        for file in files:
            if not file.endswith(".json"):
                continue

            file_path = os.path.join(subdir, file)
            text_content = open(file_path, "r").read()

            content_json = json.loads(text_content)
            original = str(content_json)

            migrated_json = mutation_function(content_json)
            mutated = str(migrated_json)

            if original != mutated:
                with open(file_path, "w") as json_file:
                    json.dump(migrated_json, json_file, indent=2, ensure_ascii=False)
                    print(f"Updated {file_path}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
