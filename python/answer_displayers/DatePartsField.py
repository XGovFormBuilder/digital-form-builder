import contextlib
import datetime

from python.answer_displayers.shared.answer_displayer import AnswerDisplayer


class DatePartsFieldDisplayer(AnswerDisplayer):
    def __init__(self, answer: str | None, date_format: str = "%d %B %Y"):
        self.raw_answer: str | None = answer
        self.date_format: str = date_format

    @property
    def _convert_to_custom_format(self) -> str | None:
        with contextlib.suppress(ValueError, TypeError):
            date_obj = datetime.datetime.strptime(self.raw_answer, "%Y-%m-%d")
            formatted_date = date_obj.strftime(self.date_format)
            return formatted_date
        return None

    @property
    def as_csv(self):
        return self._convert_to_custom_format

    @property
    def as_txt(self):
        return self._convert_to_custom_format

    @property
    def as_pdf(self):
        return self._convert_to_custom_format
