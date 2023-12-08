import pytest
from python.answer_displayers.ClientSideFileUploadField import (
    ClientSideFileUploadFieldDisplayer,
)

# we render the raw answer as-is, so we output the same as we input (for now)
_TEST_INPUTS = _TEST_OUTPUTS = [
    "Dummy Photo.jpg",
    "sample1.xlsx",
    "tmp_3bb242a6-ffc3-4d2c-816b-1d1d3e7d522a.jpg",
    "Screenshot 2022-11-09 at 08.40.41.png",
    "314899180_577390731055956_2003794745380662934_n.jpg",
]


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_csv(answer, expected_result):
    assert ClientSideFileUploadFieldDisplayer(answer).as_csv == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_txt(answer, expected_result):
    assert ClientSideFileUploadFieldDisplayer(answer).as_txt == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_pdf(answer, expected_result):
    assert ClientSideFileUploadFieldDisplayer(answer).as_pdf == expected_result
