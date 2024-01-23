from bs4 import BeautifulSoup
from python.answer_displayers.shared.answer_displayer import AnswerDisplayer


class FreeTextFieldDisplayer(AnswerDisplayer):
    def __init__(self, answer: str | None):
        self.raw_answer = answer

    @property
    def _strip_html(self):
        if self.raw_answer is None:
            return None
        parsed = BeautifulSoup(self.raw_answer, "html.parser")
        return parsed.get_text()

    @property
    def as_csv(self):
        return self._strip_html

    @property
    def as_txt(self):
        return self._strip_html

    @property
    def as_pdf(self):
        return self._strip_html
