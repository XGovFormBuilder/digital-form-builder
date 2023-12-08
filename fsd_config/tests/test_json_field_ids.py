import copy
import json
from pathlib import Path

import pytest

forms_using_field_id = {}
form_json_with_field_ids = []


def get_form_jsons_with_field_ids(files):
    form_json_with_field_ids = []
    for file in files:
        form_name = file.name
        field_ids = []
        with open(file) as jsonFile:
            data = json.load(jsonFile)
            for page in data["pages"]:
                for component in page["components"]:
                    field_id = component["name"]
                    field_ids.append(field_id)

        form_json_with_field_ids.append(
            {"form_name": form_name, "field_ids": field_ids}
        )

    return form_json_with_field_ids


def are_strings_unique(string_one, string_two):
    return string_one != string_two


def record_duplicate_field_id(field_id, current_form_name, forms_using_field_id):
    if field_id not in forms_using_field_id.keys():
        forms_using_field_id[field_id] = {current_form_name}
    else:
        forms_using_field_id[field_id].add(current_form_name)


def record_duplciated_field_ids_across_form_jsons(
    field_id, forms_to_check, forms_using_field_id
):
    for form in forms_to_check:
        for current_field_id in form["field_ids"]:
            is_unique_field_id = are_strings_unique(field_id, current_field_id)
            if is_unique_field_id is False:
                record_duplicate_field_id(
                    field_id, form["form_name"], forms_using_field_id
                )


def check_for_duplicate_field_ids_across_form_jsons(
    all_form_jsons_with_contained_field_ids,
):
    forms_using_field_id = {}

    # remove current form_json from the check for field_id uniqueness
    for form_json in all_form_jsons_with_contained_field_ids:
        forms_to_check = copy.deepcopy(all_form_jsons_with_contained_field_ids)
        forms_to_check = [
            forms_to_check[i]
            for i in range(len(forms_to_check))
            if forms_to_check[i]["form_name"] is not form_json["form_name"]
        ]

        for field_id in form_json["field_ids"]:
            record_duplciated_field_ids_across_form_jsons(
                field_id, forms_to_check, forms_using_field_id
            )

    duplicate_field_ids = [
        f'Duplicated field_id: "{field_id}" in multiple forms:' f' {", ".join(forms)}.'
        for field_id, forms in forms_using_field_id.items()
        if len(forms) > 0
    ]

    return duplicate_field_ids


form_languages = [
    "en",
    "cy",
]


@pytest.mark.parametrize("language", form_languages)
def test_check_form_json_for_duplicate_field_ids(language):
    test_path = (
        f"{Path(__file__).parent.parent.absolute()}/form_jsons/cof_r2/{language}"
    )
    form_json_files = Path(test_path).glob("*")
    all_form_jsons_with_contained_field_ids = get_form_jsons_with_field_ids(
        form_json_files
    )
    field_id_duplicates_across_forms = check_for_duplicate_field_ids_across_form_jsons(
        all_form_jsons_with_contained_field_ids
    )
    # Could add check here for duplicates within the same form_json file,
    # the form builder does not currently allow this field_id duplication
    # within the same file, so a check is not required.
    number_of_duplicated_field_ids = len(field_id_duplicates_across_forms)
    assert number_of_duplicated_field_ids == 0, "\n".join(
        field_id_duplicates_across_forms
    )
