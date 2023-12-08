#!/usr/bin/env python3
import argparse
import json

import pandas as pd


def convert_json_to_welsh(
    translations_excel_file, original_json_filepath, translated_json_filepath=None
):
    """Convert english json file `original_json_filepath` to welsh json
    `translated_json_filepath` using the translations from excel
    `translations_excel_file`.

    Note: Due to the quality of the translations provided (case-sensitive, missing characters(., ?, ', ’ )
    in translation), coverstion to welsh is not 100% accurate. Please manually review the converted welsh json.
    """

    def replace_welsh_special_characters(welsh_str):
        welsh_chars = "âêîôûŵŷäëïöüẅÿáéíóúýàèìòùỳ"
        english_replacements = "aeiouwyaeiouwyaeiouyaeiouy"

        # create translation table
        trans_table = str.maketrans(welsh_chars, english_replacements)

        # check for welsh characters using set intersection
        if set(welsh_str).intersection(set(welsh_chars)):
            # replace welsh characters with english equivalents
            new_welsh_str = welsh_str.translate(trans_table)
            return new_welsh_str
        else:
            # no welsh characters found
            return welsh_str

    # load the excel sheet into a pandas dataframe
    df = pd.read_excel(translations_excel_file)

    # remove empty rows
    df = df.dropna()

    # strip empty spaces in begining & end. And replace apostrophe character (’) with single quotes (')
    df["English"] = df["English"].str.strip().str.replace("’", "'")
    df["Welsh"] = df["Welsh"].str.strip().str.replace("’", "'")

    # create a dictionary from the dataframe where english text is key and welsh translation is value
    translation_dict = dict(zip(df["English"], df["Welsh"]))

    # load the original json file
    with open(original_json_filepath, "r") as f:
        data = json.load(f)

    # loop through each key-value pair in the json file
    def traverse(obj):
        if isinstance(obj, dict):
            if ("path" in obj) and ("title" in obj):
                if obj["path"] != "/summary":  # path keys are translated later
                    translation_dict[obj["path"]] = replace_welsh_special_characters(
                        "/"
                        + translation_dict[obj["title"]]
                        .lower()
                        .replace("'", "-")
                        .replace(" ", "-")
                    )
            for key, value in obj.items():
                if isinstance(value, str):
                    if value in translation_dict:
                        obj[key] = translation_dict[value]
                    else:
                        if (key == "content") or (
                            key == "hint"
                        ):  # path keys are translated later
                            new_value = value
                            for k, v in translation_dict.items():
                                if k in value:
                                    new_value = new_value.replace(k, v)
                            obj[key] = new_value
                else:
                    traverse(value)
        elif isinstance(obj, list):
            for item in obj:
                traverse(item)

    traverse(data)

    # traverse_path:
    def traverse_path(obj):
        if isinstance(obj, dict):
            for key, value in obj.items():
                if key == "path":
                    if obj["path"] in translation_dict:
                        obj["path"] = translation_dict[value]
                else:
                    traverse_path(value)
        elif isinstance(obj, list):
            for item in obj:
                traverse_path(item)

    traverse_path(data)

    # Set start page
    if "startPage" in data:
        data["startPage"] = data["pages"][0]["path"]

    # Output filename if not provided
    if translated_json_filepath is None:
        translated_json_filepath = data["startPage"][1:] + "-cof-r3-w1.json"

    # save the updated json file
    with open(translated_json_filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)

    print(
        "Warning: Coverstion to welsh json is not 100% accuarte. Please manually review the converted welsh json file."
    )
    print(
        f"Successfully converted & created welsh json file:'{translated_json_filepath}'"
    )


def init_argparse() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--excel_filepath",
        help="Excel file with translation(Must have columns 'English' & 'Weslh'!)",
        required=True,
    )
    parser.add_argument(
        "--original_json_filepath", help="Original Json file in English", required=True
    )
    parser.add_argument(
        "--translated_json_filepath",
        help="Welsh translated json filepath ",
        default=None,
        required=False,
    )
    return parser


if __name__ == "__main__":
    parser = init_argparse()
    args = parser.parse_args()

    excel_filepath = args.excel_filepath
    original_json_filepath = args.original_json_filepath
    translated_json_filepath = args.translated_json_filepath

    convert_json_to_welsh(
        excel_filepath, original_json_filepath, translated_json_filepath
    )

    # # Uncomment this for local testing
    # # example usage 1
    # convert_json_to_welsh('translations/community_use.xlsx',
    # 'fsd_config/form_jsons/cof_r3/en/community-use-cof-r3-w1.json', 'welsh-community_use-cof-r3-w1.json')

    # # example usage 2
    # convert_json_to_welsh('translations/community_use.xlsx',
    # 'fsd_config/form_jsons/cof_r3/en/community-use-cof-r3-w1.json')
