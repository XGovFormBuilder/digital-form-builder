import contextlib
import datetime

from python.answer_displayers.shared.answer_displayer import AnswerDisplayer


class MonthYearFieldDisplayer(AnswerDisplayer):
    def __init__(self, answer: str, date_format: str = "%B %Y"):
        self.raw_answer: str | None = answer
        self.date_format: str = date_format

    @property
    def _convert_to_custom_format(self) -> str | None:
        with contextlib.suppress(ValueError):
            date_obj = datetime.datetime.strptime(self.raw_answer, "%Y-%m")
            formatted_date = date_obj.strftime(self.date_format)
            return formatted_date
        return None

    @property
    def as_csv(self) -> str | None:
        return self._convert_to_custom_format

    @property
    def as_txt(self) -> str | None:
        return self._convert_to_custom_format

    @property
    def as_pdf(self) -> str | None:
        return self._convert_to_custom_format


class MonthYearFieldDisplayerMultiInput(AnswerDisplayer):
    def __init__(self, answer: str, date_format: str = "%B %Y"):
        self.raw_answer: str | None = answer
        self.date_format: str = date_format

    @property
    def _convert_to_custom_format(self) -> str | None:
        if self.raw_answer is None:
            return None
        month_key = [k for k in self.raw_answer.keys() if k.endswith("__month")][0]
        year_key = [k for k in self.raw_answer.keys() if k.endswith("__year")][0]
        month = self.raw_answer[month_key]
        year = self.raw_answer[year_key]
        with contextlib.suppress(ValueError):
            date_obj = datetime.datetime.strptime(f"{year}-{month}", "%Y-%m")
            formatted_date = date_obj.strftime(self.date_format)
            return formatted_date
        return None

    @property
    def as_csv(self) -> str | None:
        return self._convert_to_custom_format

    @property
    def as_txt(self) -> str | None:
        return self._convert_to_custom_format

    @property
    def as_pdf(self) -> str | None:
        return self._convert_to_custom_format
