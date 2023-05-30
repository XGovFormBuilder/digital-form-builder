# Convert English Json to Welsh Json

## Pre-requisties:

1. Install the python dependencies

```bash
python -m pip install pandas openpyxl
```

2. Please provide the translations in the below format in an excel file.
   | English | Welsh |
   | --------------------------------- | ----------------------------------------- |
   | Go back to application overview | Yn ôl i'r trosolwg o'r cais |
   | Community benefits | Buddion cymunedol |
   | In this section, we'll ask about: | Yn yr adran hon, byddwn yn holi ynghylch: |

## Conversion

For example, to convert the english json `community-use-cof-r3-w1.json` to welsh `welsh-community_use-cof-r3-w1.json` using the transaltions `community_use.xlsx`. Exceute the below cmds.

```bash
python -m fsd_config.scripts.convert_json_to_welsh --excel_filepath community_use.xlsx --original_json_filepath community-use-cof-r3-w1.json --translated_json_filepath welsh-community_use-cof-r3-w1.json
```

or

```bash
python -m fsd_config.scripts.convert_json_to_welsh --excel_filepath community_use.xlsx --original_json_filepath community-use-cof-r3-w1.json

```

Note: Due to the quality of the translations provided (case-sensitive, missing characters(., ?, ', ’ )in translation), coverstion to welsh is not 100% accurate. Please manually review the converted welsh json.
