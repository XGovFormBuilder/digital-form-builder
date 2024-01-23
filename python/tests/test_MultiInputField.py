import pytest
from python.answer_displayers.MultiInputField import MultiInputFieldDisplayer

_TEST_INPUTS_LEGACY = [
    ["Test : \u00a3100"],
    ["Test : \u00a34567", "Test : \u00a36789"],
    ["Testing A : \u00a35000", "Testing B : \u00a37000", "Testing C : \u00a31000"],
]

_TEST_OUTPUTS_LEGACY = [
    "Test: £100.00",
    "Test: £4,567.00\nTest: £6,789.00",
    "Testing A: £5,000.00\nTesting B: £7,000.00\nTesting C: £1,000.00",
]


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS_LEGACY, _TEST_OUTPUTS_LEGACY),
)
def test_as_csv(answer, expected_result):
    assert MultiInputFieldDisplayer(answer).as_csv == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS_LEGACY, _TEST_OUTPUTS_LEGACY),
)
def test_as_txt(answer, expected_result):
    assert MultiInputFieldDisplayer(answer).as_txt == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS_LEGACY, _TEST_OUTPUTS_LEGACY),
)
def test_as_pdf(answer, expected_result):
    assert MultiInputFieldDisplayer(answer).as_pdf == expected_result


_TEST_INPUTS = [
    [
        {
            "gLqiyJ": "Test Value for Money CYP Form FIRST",
            "yuzbjT": 678,
            "HpLJyL": {"HpLJyL__month": 3, "HpLJyL__year": 2024},
            "MadvIr": "Capital",
        },
        {
            "gLqiyJ": "Test Value for Money CYP Form SECOND",
            "yuzbjT": 678,
            "HpLJyL": {"HpLJyL__month": 4, "HpLJyL__year": 2024},
            "MadvIr": "Capital",
        },
    ],
    [
        {
            "GpLJDu": "Test About your organisation CYP Form",
            "IXjMWp": {
                "addressLine1": "268 Schultz Fold",
                "addressLine2": "",
                "town": "Upper Berge",
                "county": "",
                "postcode": "W12 0HS",
            },
            "MKbOlA": "https://twitter.com/luhc",
            "OghGGr": None,
            "RphKTp": None,
        }
    ],
]

_TEST_OUTPUTS_LENGTHS = [4, 5]

_TEST_TEXT_OUTPUTS = [
    "Multi-input item 1\nTest Value for Money CYP Form FIRST\n£678.00\nMarch 2024\nCapital\n\nMulti-input item 2\nTest Value for Money CYP Form SECOND\n£678.00\nApril 2024\nCapital\n\n",
    "Multi-input item 1\nTest About your organisation CYP Form\n268 Schultz Fold, Upper Berge, W12 0HS\nhttps://twitter.com/luhc\nNone\nNone\n\n",
]
_TEST_OUTPUTS = [
    [
        ["Test Value for Money CYP Form FIRST", "£678.00", "March 2024", "Capital"],
        ["Test Value for Money CYP Form SECOND", "£678.00", "April 2024", "Capital"],
    ],
    [
        [
            "Test About your organisation CYP Form",
            "268 Schultz Fold, Upper Berge, W12 0HS",
            "https://twitter.com/luhc",
            None,
            None,
        ]
    ],
]


@pytest.mark.parametrize(
    "answer, expected_answers",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_csv_multi_input(answer, expected_answers):
    answer_displayers = MultiInputFieldDisplayer(answer).as_csv
    for index, answer_displayer_dict in enumerate(answer_displayers):
        for key, expected_answer in zip(answer_displayer_dict, expected_answers[index]):
            assert answer_displayer_dict[key].as_csv == expected_answer


@pytest.mark.parametrize(
    "answer, expected_answers",
    zip(_TEST_INPUTS, _TEST_TEXT_OUTPUTS),
)
def test_as_txt_multi_input(answer, expected_answers):
    multiinput_as_text = MultiInputFieldDisplayer(answer).as_txt
    assert multiinput_as_text == expected_answers


@pytest.mark.parametrize(
    "answer, expected_answers",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_pdf_multi_input(answer, expected_answers):
    answer_displayers = MultiInputFieldDisplayer(answer).as_pdf
    for index, answer_displayer_dict in enumerate(answer_displayers):
        for key, expected_answer in zip(answer_displayer_dict, expected_answers[index]):
            assert answer_displayer_dict[key].as_pdf == expected_answer
