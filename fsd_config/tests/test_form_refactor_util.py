import pytest
from scripts import form_refactor_util

#  TODO make changes to the designer so that we do not need to run this script on every form


@pytest.mark.parametrize("mutation_key", list(form_refactor_util._MUTATIONS.keys()))
def test_mutation_function(mutation_key, tmpdir):
    input_json = open(f"tests/form_refactor_util/{mutation_key}-input.json", "r").read()
    expected_json = open(
        f"tests/form_refactor_util/{mutation_key}-expected.json", "r"
    ).read()

    test_file = tmpdir.join(f"test-{mutation_key}.json")
    with open(test_file, "w") as f:
        f.write(input_json)

    retv = form_refactor_util.main(
        (
            mutation_key,
            "--dir",
            str(tmpdir),
        )
    )

    assert retv == 0
    assert test_file.read() + "\n" == expected_json
